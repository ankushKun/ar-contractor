export const defaultContract = `
// Welcome to MixAR Studio
// Feel free to edit the following smartweave contract code and add your own functions

// This is a function
function setName(state, action) {
  // set the myName key in state to the input name
  state.myName = action.input.name;
}

function getName(state) {
  // simply return the value for myName key in state
  return state.myName;
}

// This is the handler for all of smart contract functions
export function handle(state, action) {
  const input = action.input;
  switch (input.function) {
    case "setName":
      return setName(state, action);
    // no need for return statement because we are using return
    case "getName":
      return getName(state);
    default:
      throw new ContractError(
        \`No function supplied or function not recognised: "\${input.function}".\`,
      );
  }
}
`;

export const defaultState = `
{
  "myName": ""
}
`;
