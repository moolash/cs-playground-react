import { uniqWith, isEqual, findIndex, flatten, replace } from 'lodash'

// STORE INITIALIZATION UTILS:
// codeStore initialization utility
export function populateCodeStore(CODE, arr = []) {
  for (let category in CODE) {
    CODE[category].forEach(challenge => {
      arr.push({
        id: replace(challenge.title, /\s/g, ''),
        userCode: challenge.seed
      })
    })
  }
  return arr
}

// => arr of chal IDs in correct order
export function createOrderKey(CODE) {
  const {
    SORTING_ALGOS,
    DATA_STRUCTURES,
    EASY_ALGOS,
    MODERATE_ALGOS
  } = CODE
  return flatten([
    SORTING_ALGOS,
    DATA_STRUCTURES,
    EASY_ALGOS,
    MODERATE_ALGOS
  ])
  .map(c =>
    replace(c.title, /\s/g, '')
  )
}

// MERGE CODE STORE UTILS:
// isolate new challenges, combine, remove exact dupes
function mergeCodeStores({ codeStore: initialState }, { codeStore }) {
  return uniqWith([
    ...codeStore,
    ...initialState.filter(
      challenge => findIndex(
        codeStore,
        { id: challenge.id }
      ) === -1
    )
  ], isEqual)
}

function removeDuplicates(codeStore) {
  const lsKey = 'cs-pg-react-dupes-removed'
  if (!localStorage.getItem(lsKey)) {
    for (let i = 0; i < codeStore.length; i++) {
      if (codeStore[i]) {
        const predicate = { id: codeStore[i].id }
        while (findIndex(codeStore, predicate, i+1) > i) {
          const idx = findIndex(codeStore, predicate, i+1)
          codeStore[idx] = null
        }
      }
    }
    localStorage.setItem(lsKey, true)
  }
  return codeStore.filter(challenge => challenge !== null)
}

function add_SUPPRESS_TESTS_onlyOnce(codeStore, current, welcome) {
  const lsKey = 'cs-pg-react-suppress-tests-only-once'
  if (!localStorage.getItem(lsKey)) {
    for (let challenge of codeStore) {
      challenge.userCode = challenge.userCode.concat(
        '\r\r// SUPPRESS TESTS, delete this line to activate\r'
      )
    }
    if (!current.isSolution && !welcome) {
      current.code = current.code.concat(
        '\r\r// SUPPRESS TESTS, delete this line to activate\r'
      )
    }
    localStorage.setItem(lsKey, true)
  }
  return { codeStore, current }
}

// compose utils, return dupe free code store
export function composeCodeStore(initialState, defaultState) {
  return add_SUPPRESS_TESTS_onlyOnce(
    removeDuplicates(
      mergeCodeStores(initialState, defaultState),
      initialState.codeStore
    ),
    defaultState.current,
    defaultState.welcome
  )
}
