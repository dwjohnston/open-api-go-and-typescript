/*
 * Swagger Petstore
 *
 * A sample API that uses a petstore as an example to demonstrate features in the swagger-2.0 specification
 *
 * API version: 1.0.0
 * Contact: apiteam@swagger.io
 * Generated by: OpenAPI Generator (https://openapi-generator.tech)
 */

package openapi

type NewPet struct {

	Id int64 `json:"id"`

	Name string `json:"name"`

	Tag string `json:"tag,omitempty"`

	Description int64 `json:"description,omitempty"`
}

// AssertNewPetRequired checks if the required fields are not zero-ed
func AssertNewPetRequired(obj NewPet) error {
	elements := map[string]interface{}{
		"id": obj.Id,
		"name": obj.Name,
	}
	for name, el := range elements {
		if isZero := IsZeroValue(el); isZero {
			return &RequiredError{Field: name}
		}
	}

	return nil
}

// AssertRecurseNewPetRequired recursively checks if required fields are not zero-ed in a nested slice.
// Accepts only nested slice of NewPet (e.g. [][]NewPet), otherwise ErrTypeAssertionError is thrown.
func AssertRecurseNewPetRequired(objSlice interface{}) error {
	return AssertRecurseInterfaceRequired(objSlice, func(obj interface{}) error {
		aNewPet, ok := obj.(NewPet)
		if !ok {
			return ErrTypeAssertionError
		}
		return AssertNewPetRequired(aNewPet)
	})
}
