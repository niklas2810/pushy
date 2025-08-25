// Utility to get or create a UUID for the user in localStorage
export function getOrCreateUserId(): string {
  function uuidv4(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = crypto.getRandomValues(new Uint8Array(1))[0] % 16;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  let userid = localStorage.getItem("userid");
  if (!userid) {
    userid = uuidv4();
    localStorage.setItem("userid", userid);
  }
  return userid;
}
