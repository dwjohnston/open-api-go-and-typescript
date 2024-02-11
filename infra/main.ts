import { Construct } from 'constructs';
import { App, TerraformStack, TerraformOutput } from 'cdktf';
import { AwsProvider } from "@cdktf/provider-aws/lib/provider";

import { EcrRepository } from "@cdktf/provider-aws/lib/ecr-repository";
import { EcsCluster } from "@cdktf/provider-aws/lib/ecs-cluster";
import { EcsService } from "@cdktf/provider-aws/lib/ecs-service";
import { EcsTaskDefinition } from "@cdktf/provider-aws/lib/ecs-task-definition";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";


import * as path from "path";
import { SecurityGroupRule } from '@cdktf/provider-aws/lib/security-group-rule';
class MyDockerAppStack extends TerraformStack {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    // Define AWS provider
    new AwsProvider(this, 'aws', {
      region: 'ap-southeast-2',
    });

    // // Define an EC2 instance
    // const instance = new EC2Instance(this, 'ec2Instance', {
    //   ami: 'ami-0abc123def456xyz', // Replace with your AMI ID
    //   instanceType: 't2.micro',
    //   tags: {
    //     Name: 'MyEC2Instance',
    //   },
    // });

    // Define an ECR repository
    // const repository = new EcrRepository(this, 'ecrRepository', {
    //   name: 'repo_name',
    // });

    // Define an ECS cluster
    const cluster = new EcsCluster(this, 'ecsCluster', {
      name: 'MyEcsCluster',
    });

    // Define an ECS task definition
    const taskDefinition = new EcsTaskDefinition(this, 'ecsTaskDefinition', {
      family: 'MyTaskDefinition',
      containerDefinitions: JSON.stringify([
        {
          name: 'myContainer',
          image: '166963536078.dkr.ecr.ap-southeast-2.amazonaws.com/my_image_repo:my-imge', // Replace with your Docker image URI
          portMappings: [{ containerPort: 80 }],
          memory: 512
        },
      ]),
    });

    const securityGroup = new SecurityGroup(this, 'securityGroup', {
      name: 'MySecurityGroup',
      description: 'Security group for my Docker container',
      tags: {
        Name: 'MySecurityGroup',
      },
    });
    
    // Allow inbound traffic on port 80 (HTTP) and port 443 (HTTPS) from anywhere
    new SecurityGroupRule(this, 'httpIngressRule', {
      securityGroupId: securityGroup.id,
      type: 'ingress',
      fromPort: 80,
      toPort: 80,
      protocol: 'tcp',
      cidrBlocks: ['0.0.0.0/0'],
    });
    
    new SecurityGroupRule(this, 'httpsIngressRule', {
      securityGroupId: securityGroup.id,
      type: 'ingress',
      fromPort: 443,
      toPort: 443,
      protocol: 'tcp',
      cidrBlocks: ['0.0.0.0/0'],
    });

    // Define an ECS service
   const ecsService =new EcsService(this, 'ecsService', {
      name: "foo",
      cluster: cluster.id,
      taskDefinition: taskDefinition.arn,
      desiredCount: 1,
      launchType: 'EC2',
      // networkConfiguration: {
      //   subnets: ['subnet-12345678'], // Replace with your subnet ID
      //   securityGroups: ['sg-12345678'], // Replace with your security group ID
      // },
    });

    // Output the public IP address of the EC2 instance
    new TerraformOutput(this, 'publicIp', {
      value: ecsService.id
    });
  }
}

const app = new App();
new MyDockerAppStack(app, 'MyDockerAppStack');
app.synth();
