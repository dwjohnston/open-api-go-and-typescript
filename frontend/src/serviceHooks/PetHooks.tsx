import { useQuery } from "@tanstack/react-query";
import { petsApi } from "../services/petsService";

export function usePet(petId:number){

    return useQuery({
        queryFn: () => petsApi.findPetById({ id: petId}),
        queryKey: ["pet", petId],
    }); 


}