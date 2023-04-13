import React, { useCallback, useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { NewPet, Pet } from './generated/models';
import { petsApi } from './services/petsService';
import { DisplayPetById } from './components/DisplayPetById';



type PetsHook = {
  status: "loading" | "success" | "error";
  pets: null | Array<Pet>;

  addPet: (newPet: NewPet) => void;
  updatePet: (pet: Pet) => void;
}
function usePets(): PetsHook {



  const [status, setStatus] = useState("loading" as PetsHook["status"]);
  const [pets, setPets] = useState(null as null | Array<Pet>);

  const getPets = useCallback(() => {

    setStatus("loading");
    petsApi.findPets().then((pets) => {
      setPets(pets);
      setStatus("success")
    }).catch((err) => {

      console.log(err);
      setStatus("error");
    });

  }, []);

  const addPet = useCallback((newPet: NewPet) => {

    setStatus("loading");
    petsApi.addPet({ pet: newPet }).then((v) => {
      setStatus("success");
      getPets();
    }).catch((err) => {
      setStatus("error");
    });
  }, [setStatus, getPets]);

  const updatePet = useCallback(() => {
    throw new Error("not implemented");
  }, []);




  useEffect(() => {
    getPets();
  }, [getPets]);

  return {
    addPet,
    updatePet,
    pets,
    status
  }

}

function App() {

  const { status, pets, addPet } = usePets();

  return (
    <div className="App">


      {status === "loading" && <span>Loading...</span>}
      {status === "error" && <span style={{ color: "red" }}>Error!</span>}

      {pets && pets.map((v) => {
        return <DisplayPetById petId={v.id} key={v.id} />

      })}



      <form onSubmit={(e) => {
        e.preventDefault();

        //@ts-ignore
        const data = new FormData(e.target) as any;

        addPet({
          id: parseInt(data.get("id")),
          name: data.get("name"),
          tag: data.get("tag"),
        })

      }}>
        <input type="number" name="id" placeholder='id' />
        <input type="text" name="name" placeholder='name' />
        <input type="text" name="tag" placeholder='tag' />

        <button type="submit">Create new pet</button>

      </form>
    </div>
  );
}

export default App;
