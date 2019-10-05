import Effect from "../Effect"

// doc :: Effect String Document
const doc = Effect((err, succ) =>
  document === undefined
    ? err(
        "doc()\nFailed to retrieve global document object as it is undefined."
      )
    : succ(document)
)

export default doc
