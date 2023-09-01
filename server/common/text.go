package common

import (
	"regexp"
	"strings"
)

func ProcessTextHandler(text string) string {
	re := regexp.MustCompile("\n+")
	cleanedText := re.ReplaceAllString(text, "\n")
	return cleanedText
}

func SplitTextByNewLine(text string) []string {
	return strings.Split(text, "\n")
}
