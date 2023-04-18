import { Configuration, ResponseError } from "../generated";
import { DefaultApi } from "../generated/apis/DefaultApi";

const petsApi = new DefaultApi(new Configuration({
    basePath: "http://localhost:8080/api", 
    
}));


function validateErr(err: unknown): err is ResponseError {
    return err instanceof ResponseError; 
}


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

     
        }catch(err){

            if (validateErr(err)){
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