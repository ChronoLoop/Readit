package common

import (
	"encoding/json"
	"fmt"
)

func PrintStruct(s interface{}) {
	bytes, _ := json.MarshalIndent(s, "", "  ")
	fmt.Printf("\nstruct: %s\n", string(bytes))
}
