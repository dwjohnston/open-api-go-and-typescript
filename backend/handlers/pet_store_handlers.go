package operations

import (
	"github.com/go-openapi/runtime/middleware"

	"myserver/restapi/operations"
)

func handleGetPets(params operations.AddPetParams) middleware.Responder {
	return middleware.NotImplemented("operation operations.FindPetByID has not yet been implemented")
}

func handleGetPet(params operations.FindPetByIDParams) middleware.Responder {
	return middleware.NotImplemented("operation operations.FindPetByID has not yet been implemented")
}

func handlePostPet(params operations.FindPetsParams) middleware.Responder {
	return middleware.NotImplemented("operation operations.FindPetByID has not yet been implemented")
}
