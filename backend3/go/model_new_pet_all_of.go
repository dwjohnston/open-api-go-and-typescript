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

type NewPetAllOf struct {

	Description int64 `json:"description,omitempty"`
}

// AssertNewPetAllOfRequired checks if the required fields are not zero-ed
func AssertNewPetAllOfRequired(obj NewPetAllOf) error {
	return nil
}

// AssertRecurseNewPetAllOfRequired recursively checks if required fields are not zero-ed in a nested slice.
// Accepts only nested slice of NewPetAllOf (e.g. [][]NewPetAllOf), otherwise ErrTypeAssertionError is thrown.
func AssertRecurseNewPetAllOfRequired(objSlice interface{}) error {
	return AssertRecurseInterfaceRequired(objSlice, func(obj interface{}) error {
		aNewPetAllOf, ok := obj.(NewPetAllOf)
		if !ok {
			return ErrTypeAssertionError
		}
		return AssertNewPetAllOfRequired(aNewPetAllOf)
	})
}
