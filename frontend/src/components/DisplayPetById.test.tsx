import React from 'react';
// We have a custom render method which includes the react-query provider
import {render} from "../testUtils/testRender";
import {screen} from "@testing-library/react";
import {DisplayPetById} from './DisplayPetById';

// Import handlers from the generated MSW boilerplate
import {handlers} from "../generated/msw";
import { setupServer } from 'msw/lib/node';


const server = setupServer(...handlers);

describe(DisplayPetById, () => {


    beforeAll(() => {
        // Establish requests interception layer before all tests.
        server.listen()
      })
      afterAll(() => {
        // Clean up after all tests are done, preventing this
        // interception layer from affecting irrelevant tests.
        server.close()
      })

  it("Renders without error", async () => {
    render(<DisplayPetById  petId={1}/>)


    expect(screen.getByText("...loading")).toBeInTheDocument(); 
    // The petname is based on the example we set in the OpenAPI definition!
    expect(await screen.findByText("Pet Name: Fido")).toBeInTheDocument(); 


  }); 
});
