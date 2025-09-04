const hasDisallowedProperties = (obj: object, allowedKeys: string[]) =>
  Object.keys(obj).some(key => !allowedKeys.includes(key));

export default hasDisallowedProperties;