
import React from 'react';
import { usePet } from '../serviceHooks/PetHooks';

export type DisplayPetByIdProps = {
  petId: number; 
};



export const DisplayPetById = (props: DisplayPetByIdProps) => {
  const petQuery = usePet(props.petId); 

  return (
    <div style={{
      border: "solid 1px grey", 
      margin: 12,
      padding: 12,
    }}>
      {petQuery.isLoading && "...loading"}
      {petQuery.isError && "Error!"}
      {petQuery.data && <>
        Pet Name: {petQuery.data.name}
      </>}
    </div>
  );
};
