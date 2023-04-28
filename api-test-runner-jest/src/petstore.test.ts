import { Configuration, ResponseError } from "../generated";
import { DefaultApi } from "../generated/apis/DefaultApi";
import { exec, ChildProcess } from "node:child_process";

const petsApi = new DefaultApi(new Configuration({
    basePath: "http://localhost:8080/api",
}));

function validateErr(err: unknown): err is ResponseError {
    return err instanceof ResponseError;
}

let serverProcess: ChildProcess;

beforeEach(() => {
    // We can execute asynchronous code in a beforeEach and afterEach blocks of jest
    // by returning a promise see: https://jestjs.io/docs/setup-teardown#repeating-setup:~:text=can%20handle%20asynchronous%20code%20in%20the%20same%20ways%20that%20tests%20can%20handle%20asynchronous%20code
    // What we're doing is we'll resolve the promise when we see that the server is running
    return new Promise(res => {

        // We start our application running 
        // Note that we need to run the compiled binary! 
        // If trying to run `go run` you run into this issue: https://stackoverflow.com/questions/76051959/node-child-processes-why-does-kill-not-close-a-go-run-process-but-will
        serverProcess = exec(`PET_NAME_SERVICE_URL="https://jsonplaceholder.typicode.com/users" ./main`, {
            cwd: `${process.cwd()}/../backend`
        });

        // We wait for the 'Server started' message to come, and we resolve the promise then
        // 🤔 Why is it on stderr though?
        serverProcess.stderr?.on("data", (chunk) => {
            if (typeof chunk === "string" && chunk.includes("Server started")) {
                res(null);
            }
        })
        serverProcess.stdout?.on("data", (chunk) => {
            console.log(chunk)
        })
    });
});


// After each test, we similarly return a promise
// We send a signal to kill the process we spawn, and wait for that to close completely before resolving the promise. 
afterEach(() => {
    return new Promise((res) => {
        serverProcess.kill();
        serverProcess.on("close", () => {
            res(null);
        })
    });
});


describe("Test Scenario 1 - Create a Pet then retrieve it", () => {

    it("Can create and retrieve a pet OK", async () => {
        const initialResult = await petsApi.findPetsRaw({});
        expect(initialResult.raw.status).toBe(200);
        const initialResultBody = await initialResult.value();
        expect(initialResultBody).toHaveLength(0);

        const apiResult1 = await petsApi.addPetRaw({
            pet: {
                id: 123,
                name: "Fido"
            }
        });

        expect(apiResult1.raw.status).toBe(201);
        const apiResultBody = await apiResult1.value();
        expect(apiResultBody.id).toBe(123);
        expect(apiResultBody.name).toBe("Fido");

        const newState = await petsApi.findPetsRaw({});
        expect(newState.raw.status).toBe(200);
        const newStateBody = await newState.value();
        expect(newStateBody).toHaveLength(1);
    });


});




describe("Test Scenario 2 - Create a Pet, then create a Pet with the name ID", () => {
    it("Returns an HTTP 409", async () => {
        const apiResult1 = await petsApi.addPetRaw({
            pet: {
                id: 321,
                name: "Fido"
            }
        });

        expect(apiResult1.raw.status).toBe(201);
        const apiResult1Body = await apiResult1.value();
        expect(apiResult1Body.id).toBe(321);


        try {
            const apiResult2 = await petsApi.addPetRaw({
                pet: {
                    id: 321,
                    name: "Charles"
                }
            });
        } catch (err) {

            if (validateErr(err)) {
                expect(err.response.status).toBe(409);
                const body = await err.response.json();
                // Unfortunately these are untyped
                expect(body.id).toBe(321);
                expect(body.name).toBe("Fido")
            }
            else {
                throw err;
            }

        }


    });
});


describe("Test Scenario 3 - forbidden pet names", () => {


    it("Forbidden pet names will return 403", async () => {
        const initialResult = await petsApi.findPetsRaw({});
        expect(initialResult.raw.status).toBe(200);
        const initialResultBody = await initialResult.value();
        expect(initialResultBody).toHaveLength(0);


        try {
            const apiResult1 = await petsApi.addPetRaw({
                pet: {
                    id: 123,
                    name: "Samantha"
                }
            });

        } catch (err) {
            if (validateErr(err)) {
                expect(err.response.status).toBe(403);
                const body = await err.response.json();
                // Unfortunately these are untyped
                expect(body.code).toBe(403);
                expect(body.message).toBe("Disallowed pet name")
            }
            else {
                throw err;
            }
        }

        const result2 = await petsApi.findPetsRaw({});
        expect(result2.raw.status).toBe(200);
        const result2Body = await result2.value();
        expect(result2Body).toHaveLength(0);
    


    });

});


describe("A performance test, get when there are 10 pets", () => {

    it("Works as expected", async () => {

        const initialResult = await petsApi.findPetsRaw({});
        expect(initialResult.raw.status).toBe(200);
        const initialResultBody = await initialResult.value();
        expect(initialResultBody).toHaveLength(0);

        const proms = new Array(10).fill(true).map(async (v, i) => {
            const apiResult1 = await petsApi.addPetRaw({
                pet: {
                    id: i + 1,
                    name: "Fido"
                }
            });

            expect(apiResult1.raw.status).toBe(201);
            const apiResultBody = await apiResult1.value();
            expect(apiResultBody.id).toBe(i + 1);
            expect(apiResultBody.name).toBe("Fido");
        });


        await Promise.all(proms);

        const newState = await petsApi.findPetsRaw({});
        expect(newState.raw.status).toBe(200);
        const newStateBody = await newState.value();
        expect(newStateBody).toHaveLength(10);
    });
}); 