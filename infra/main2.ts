import { Construct } from "constructs";
import { App, TerraformStack, Fn , TerraformAsset, TerraformOutput} from "cdktf";

import { AwsProvider } from "@cdktf/provider-aws/lib/provider";
import { DataAwsEcrAuthorizationToken } from "@cdktf/provider-aws/lib/data-aws-ecr-authorization-token";
import { EcrRepository } from "@cdktf/provider-aws/lib/ecr-repository";
import { EcsCluster } from "@cdktf/provider-aws/lib/ecs-cluster";
import { EcsClusterCapacityProviders } from "@cdktf/provider-aws/lib/ecs-cluster-capacity-providers";
import { EcsTaskDefinition } from "@cdktf/provider-aws/lib/ecs-task-definition";
import { IamRole } from "@cdktf/provider-aws/lib/iam-role";
import { Lb } from "@cdktf/provider-aws/lib/lb";
import { LbListener } from "@cdktf/provider-aws/lib/lb-listener";
import { CloudfrontDistribution } from "@cdktf/provider-aws/lib/cloudfront-distribution";

import { CloudwatchLogGroup } from "@cdktf/provider-aws/lib/cloudwatch-log-group";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";

import { NullProvider } from "@cdktf/provider-null/lib/provider";
import { DockerProvider } from "@cdktf/provider-docker/lib/provider";
import { Resource } from "@cdktf/provider-null/lib/resource";
import { Password } from "./.gen/providers/random/password";
import { Rds } from "./.gen/modules/terraform-aws-modules/aws/rds";
import { Uuid } from "./.gen/providers/random/uuid";
import * as path from "path";
import { EcsService } from "@cdktf/provider-aws/lib/ecs-service";
import { LbTargetGroup } from "@cdktf/provider-aws/lib/lb-target-group";
import { LbListenerRule } from "@cdktf/provider-aws/lib/lb-listener-rule";
import { Vpc} from "./.gen/modules/terraform-aws-modules/aws/vpc";
import { sha256 } from "./sha256";
const BACKEND_ORIGIN_ID = "backendOrigin";

const REGION = "ap-southeast-2"; 

const tags = {
  team: "cdk",
  owner: "blacksheepcode",
};
class MyStack extends TerraformStack {
  constructor(scope: Construct, name: string, random: string) {
    super(scope, name);
    const region = "us-east-1";

    // We need to instanciate all providers we are going to use
    new AwsProvider(this, "aws", {
      region: REGION,
    });
    new DockerProvider(this, "docker");
    new NullProvider(this, "provider", {});

    const vpc = new Vpc(this, "vpc", {
      // We use the name of the stack
      name,
      // We tag every resource with the same set of tags to easily identify the resources
      tags,
      cidr: "10.0.0.0/16",
      // We want to run on three availability zones
      azs: ["a", "b", "c"].map((i) => `${REGION}${i}`),
      // We need three CIDR blocks as we have three availability zones
      privateSubnets: ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"],
      publicSubnets: ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"],
      databaseSubnets: ["10.0.201.0/24", "10.0.202.0/24", "10.0.203.0/24"],
      createDatabaseSubnetGroup: true,
      enableNatGateway: true,
      // Using a single NAT Gateway will save us some money, coming with the cost of less redundancy
      singleNatGateway: true,
    });

    const cluster = new Cluster(this, "cluster");

    const loadBalancer = new LoadBalancer(
      this,
      "loadbalancer",
      vpc,
      cluster.cluster
    );



    const serviceSecurityGroup = new SecurityGroup(
      this,
      `${name}-service-security-group`,
      {
        vpcId: vpc.vpcIdOutput,
        tags,
        ingress: [
          // only allow incoming traffic from our load balancer
          {
            protocol: "TCP",
            fromPort: 80,
            toPort: 80,
            securityGroups: loadBalancer.lb.securityGroups,
          },
        ],
        egress: [
          // allow all outgoing traffic
          {
            fromPort: 0,
            toPort: 0,
            protocol: "-1",
            cidrBlocks: ["0.0.0.0/0"],
            ipv6CidrBlocks: ["::/0"],
          },
        ],
      }
    );

    const assetBackend = new TerraformAsset(this, `assetBackend`, {
      path: "../backend",
    });

    const assetFrontend = new TerraformAsset(this, `assetFrontend`, {
      path: "../frontend",
    });

    const assetDockerfile = new TerraformAsset(this, `assetDockerfile`, {
      path: "../Dockerfile",
    });

    const assetNginxConf = new TerraformAsset(this, `assetNginxConf`, {
      path: "../nginx.conf",
    });

    const assetSupervisord = new TerraformAsset(this, `assetSupervisord`, {
      path: "../supervisord.conf",
    });


      const s = sha256(`${assetBackend.assetHash}-${assetFrontend.assetHash}-${assetDockerfile.assetHash}-${assetNginxConf.assetHash}-${assetSupervisord.assetHash}`);
      //@ts-ignore
      const tag = s.hex();

    const { image: backendImage, tag: backendTag } = new PushedECRImage(
      this,
      "backend-image",
      path.resolve(__dirname, ".."), 
      tag
    );

    const task = cluster.runDockerImage("backend", backendImage, backendTag,{
      PORT: "80",
    });

    loadBalancer.exposeService(
      "backend",
      task,
      serviceSecurityGroup,
      '/'
    );

    const cdn = new CloudfrontDistribution(this, "cf", {
      comment: `Docker example frontend`,
      tags,
      enabled: true,
      defaultCacheBehavior: {
        targetOriginId: BACKEND_ORIGIN_ID,
          // Allow every method as we want to also serve the backend through this
          allowedMethods: [
            "DELETE",
            "GET",
            "HEAD",
            "OPTIONS",
            "PATCH",
            "POST",
            "PUT",
          ],
          cachedMethods: ["GET", "HEAD"],
          viewerProtocolPolicy: "redirect-to-https", // ensure we serve https
          forwardedValues: { queryString: false, cookies: { forward: "none" } },
          
        },
      
      // origins describe different entities that can serve traffic
      origin: [
        {
          domainName: loadBalancer.lb.dnsName, // our backend is served by the load balancer
          originId: BACKEND_ORIGIN_ID,
          customOriginConfig:             {
              originProtocolPolicy: "http-only",
              httpPort: 80,
              httpsPort: 443,
              originSslProtocols: ["TLSv1.2", "TLSv1.1", "TLSv1"],
            },
          
        },
      ],
      // We define everything that should not be served by the default here
      // orderedCacheBehavior: [
      //   {
      //     allowedMethods: [
      //       "HEAD",
      //       "DELETE",
      //       "POST",
      //       "GET",
      //       "OPTIONS",
      //       "PUT",
      //       "PATCH",
      //     ],
      //     cachedMethods: ["HEAD", "GET"],
      //     pathPattern: "/backend/*", // our backend should be served under /backend
      //     targetOriginId: BACKEND_ORIGIN_ID,
      //     // low TTLs so that the cache is busted relatively quickly
      //     minTtl: 0,
      //     defaultTtl: 10,
      //     maxTtl: 50,
      //     viewerProtocolPolicy: "redirect-to-https",
      //     // currently our backend needs none of this, but it could potentially use any of these now
      //     forwardedValues: {
      //         queryString: true,
      //         headers: ["*"],
      //         cookies:                 {
      //             forward: "all",
      //           },
              
      //       },
          
      //   },
      // ],
      // defaultRootObject: "index.html",
      restrictions: { geoRestriction: { restrictionType: "none" } },
      viewerCertificate: { cloudfrontDefaultCertificate: true }, // we use the default SSL Certificate
    });
  

    new TerraformOutput(this, "domainName", {
      value: cdn.domainName,
    });
    new TerraformOutput(this, "backendImage", {
      value: backendImage,
    });
    new TerraformOutput(this, "backendTag", {
      value: backendTag,
    });

    new TerraformOutput(this, "lb", {
      value: loadBalancer.lb.dnsName
    });

    new TerraformOutput(this, "tag", {value: tag})

  }
}

class Cluster extends Construct {
  public cluster: EcsCluster;
  constructor(scope: Construct, clusterName: string) {
    super(scope, clusterName);

    const cluster = new EcsCluster(this, `ecs-${clusterName}`, {
      name: clusterName,
      tags,
    });

    new EcsClusterCapacityProviders(this, `capacity-providers-${clusterName}`, {
      clusterName: cluster.name,
      capacityProviders: ["FARGATE"],
    });

    this.cluster = cluster;
  }

  public runDockerImage(
    name: string,
    image: Resource, 
    backendTag: string, 
    env: Record<string, string | undefined>
  ) {
    // Role that allows us to get the Docker image
    const executionRole = new IamRole(this, `execution-role`, {
      name: `${name}-execution-role`,
      tags,
      inlinePolicy: [
        {
          name: "allow-ecr-pull",
          policy: JSON.stringify({
            Version: "2012-10-17",
            Statement: [
              {
                Effect: "Allow",
                Action: [
                  "ecr:GetAuthorizationToken",
                  "ecr:BatchCheckLayerAvailability",
                  "ecr:GetDownloadUrlForLayer",
                  "ecr:BatchGetImage",
                  "logs:CreateLogStream",
                  "logs:PutLogEvents",
                ],
                Resource: "*",
              },
            ],
          }),
        },
      ],
      // this role shall only be used by an ECS task
      assumeRolePolicy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [
          {
            Action: "sts:AssumeRole",
            Effect: "Allow",
            Sid: "",
            Principal: {
              Service: "ecs-tasks.amazonaws.com",
            },
          },
        ],
      }),
    });

    // Role that allows us to push logs
    const taskRole = new IamRole(this, `task-role`, {
      name: `${name}-task-role`,
      tags,
      inlinePolicy: [
        {
          name: "allow-logs",
          policy: JSON.stringify({
            Version: "2012-10-17",
            Statement: [
              {
                Effect: "Allow",
                Action: ["logs:CreateLogStream", "logs:PutLogEvents"],
                Resource: "*",
              },
            ],
          }),
        },
      ],
      assumeRolePolicy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [
          {
            Action: "sts:AssumeRole",
            Effect: "Allow",
            Sid: "",
            Principal: {
              Service: "ecs-tasks.amazonaws.com",
            },
          },
        ],
      }),
    });

    // Creates a log group for the task
    const logGroup = new CloudwatchLogGroup(this, `loggroup`, {
      name: `${this.cluster.name}/${name}`,
      retentionInDays: 30,
      tags,
    });

    // Creates a task that runs the docker container
    const task = new EcsTaskDefinition(this, `task`, {
      // We want to wait until the image is actually pushed
      dependsOn: [image],
      tags,
      // These values are fixed for the example, we can make them part of our function invocation if we want to change them
      cpu: "256",
      memory: "512",
      requiresCompatibilities: ["FARGATE", "EC2"],
      networkMode: "awsvpc",
      executionRoleArn: executionRole.arn,
      taskRoleArn: taskRole.arn,
      containerDefinitions: JSON.stringify([
        {
          name,
          image: backendTag,
          cpu: 256,
          memory: 512,
          environment: Object.entries(env).map(([name, value]) => ({
            name,
            value,
          })),
          portMappings: [
            {
              containerPort: 80,
              hostPort: 80,
            },
          ],
          logConfiguration: {
            logDriver: "awslogs",
            options: {
              // Defines the log
              "awslogs-group": logGroup.name,
              "awslogs-region": REGION,
              "awslogs-stream-prefix": name,
            },
          },
        },
      ]),
      family: "service",
    });

    return task;
  }
}

class LoadBalancer extends Construct {
  lb: Lb;
  lbl: LbListener;
  vpc: Vpc;
  cluster: EcsCluster;

  constructor(scope: Construct, name: string, vpc: Vpc, cluster: EcsCluster) {
    super(scope, name);
    this.vpc = vpc;
    this.cluster = cluster;

    const lbSecurityGroup = new SecurityGroup(
      scope,
      `${name}-lb-security-group`,
      {
        vpcId: vpc.vpcIdOutput,
        tags,
        ingress: [
          // allow HTTP traffic from everywhere
          {
            protocol: "TCP",
            fromPort: 80,
            toPort: 80,
            cidrBlocks: ["0.0.0.0/0"],
            ipv6CidrBlocks: ["::/0"],
          },
        ],
        egress: [
          // allow all traffic to every destination
          {
            fromPort: 0,
            toPort: 0,
            protocol: "-1",
            cidrBlocks: ["0.0.0.0/0"],
            ipv6CidrBlocks: ["::/0"],
          },
        ],
      }
    );
    this.lb = new Lb(scope, `${name}-lb`, {
      name,
      tags,
      // we want this to be our public load balancer so that cloudfront can access it
      internal: false,
      loadBalancerType: "application",
      securityGroups: [lbSecurityGroup.id],
      subnets: Fn.tolist(vpc.publicSubnetsOutput),
    });

    this.lbl = new LbListener(scope, `${name}-lb-listener`, {
      loadBalancerArn: this.lb.arn,
      port: 80,
      protocol: "HTTP",
      tags,
      defaultAction: [
        // We define a fixed 404 message, just in case
        {
          type: "fixed-response",
          fixedResponse:             {
              contentType: "text/plain",
              statusCode: "404",
              messageBody: "Could not find the resource you are looking for",
            },
          
        },
      ],
    });
  }

  exposeService(
    name: string,
    task: EcsTaskDefinition,
    serviceSecurityGroup: SecurityGroup, 
    path: string, 
  ) {
    const targetGroup = new LbTargetGroup(this, `target-group`, {
      dependsOn: [this.lbl],
      tags,
      name: `${name}-target-group`,
      port: 80,
      protocol: "HTTP",
      targetType: "ip",
      vpcId: Fn.tostring(this.vpc.vpcIdOutput),
      healthCheck: {
        enabled: true,
        path: "/ready",
      },
    });

    // Makes the listener forward requests from subpath to the target group
    new LbListenerRule(this, `rule`, {
      listenerArn: this.lbl.arn,
      priority: 100,
      tags,
      action: [
        {
          type: "forward",
          targetGroupArn: targetGroup.arn,
        },
      ],

      condition: [
        {
          pathPattern: { values: [`${path}*`] },
        },
      ],
    });

    // Ensure the task is running and wired to the target group, within the right security group
    new EcsService(this, `service`, {
      dependsOn: [this.lbl],
      tags,
      name,
      launchType: "FARGATE",
      cluster: this.cluster.id,
      desiredCount: 1,
      taskDefinition: task.arn,
      networkConfiguration: {
        subnets: Fn.tolist(this.vpc.publicSubnetsOutput),
        assignPublicIp: true,
        securityGroups: [serviceSecurityGroup.id],
      },
      loadBalancer: [
        {
          containerPort: 80,
          containerName: name,
          targetGroupArn: targetGroup.arn,
        },
      ],
    });
  }
  }



class PushedECRImage extends Construct {
  tag: string;
  image: Resource;
  constructor(scope: Construct, name: string, projectPath: string, artifactHash: string) {
    super(scope, name);
    const repo = new EcrRepository(this, `ecr`, {
      name,
      tags,
    });

    const auth = new DataAwsEcrAuthorizationToken(this, `auth`, {
      dependsOn: [repo],
      registryId: repo.registryId,
    });





    this.tag = `${repo.repositoryUrl}:${artifactHash}`;
    // Workaround due to https://github.com/kreuzwerker/terraform-provider-docker/issues/189
    this.image = new Resource(this, `image`, {

      triggers: {
        key: artifactHash
      },
      provisioners: [
        {
          type: "local-exec",
          workingDir: projectPath,
          command: `docker login -u ${auth.userName} -p ${auth.password} ${auth.proxyEndpoint} && 
  docker build -t ${this.tag} . && 
  docker push ${this.tag}`,
        },
      ],
    });
   
  }
}


const app = new App({skipValidation:true});
new MyStack(app, "example-docker-aws", Math.random +"");
app.synth();

