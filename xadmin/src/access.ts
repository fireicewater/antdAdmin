export default function (initialState: { userPermissions: string[], permissions: string[] }) {

  const {permissions, userPermissions} = initialState

  return permissions.reduce((prev, next) => {
    prev[next] = userPermissions.includes(next);
    return prev;
  }, {} as {
    [index: string]: boolean;
  });
}

