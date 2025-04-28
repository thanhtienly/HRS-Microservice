export default function errorMapping(error: string | undefined) {
  const errorDictionary = {
    "": "Unknown error",
    "Invalid Token": "Login required",
    "Access Token expired": "Login required",
  };

  var keys = Object.keys(errorDictionary);
  for (let i = 0; i < keys.length; i++) {
    if (error == keys[i]) {
      return Object.values(errorDictionary)[i];
    }
  }

  return error;
}
