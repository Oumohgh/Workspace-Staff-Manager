const STORAGE_KEY = "employees1";

const ZONE_CAPACITY = {
  conference: 4,
  reception: 4,
  serveurs: 4,
  securite: 4,
  personnel: 4,
  archives: 2
};

const ROOM_IDS = {
  conference: "zone-conference",
  reception: "zone-reception",
  serveurs: "zone-serveurs",
  securite: "zone-securite",
  personnel: "zone-personnel",
  archives: "zone-archives"
};

/* Rôles compatibles -> zones autorisées */
const roleZones = {
  it: ["serveurs"],
  securite: ["securite"],
  reception: ["reception"],
  manager: ["reception","serveurs","securite","personnel","archives","conference"],
  nettoyage: ["reception","serveurs","securite","personnel","conference"],
  autres: ["reception","serveurs","securite","personnel","conference","archives"]
};
