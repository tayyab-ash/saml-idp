import { NAME_ID_FORMAT } from "../users/user.mapper";

export const ATTRIBUTE_METADATA = [
  {
    id: "id",
    optional: false,
    displayName: "Id",
    description: "The user id",
    multiValue: false,
  },
  {
    id: "firstName",
    optional: false,
    displayName: "First Name",
    description: "The given name of the user",
    multiValue: false,
  },
  {
    id: "lastName",
    optional: false,
    displayName: "Last Name",
    description: "The surname of the user",
    multiValue: false,
  },
  {
    id: "username",
    optional: false,
    displayName: "Username",
    description: "The username of the user",
    multiValue: false,
  },
  {
    id: "email",
    optional: false,
    displayName: "E-Mail Address",
    description: "The e-mail address of the user",
    multiValue: false,
  },
];

export interface SamlProfile {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
}

interface ProfileMapperInstance {
  _pu: SamlProfile;
  metadata: typeof ATTRIBUTE_METADATA;
  getClaims: () => Record<string, string | string[]>;
  getNameIdentifier: () => {
    nameIdentifier: string;
    nameIdentifierFormat: string;
  };
}

export interface ProfileMapperConstructor {
  new (user: SamlProfile): ProfileMapperInstance;
  (user: SamlProfile): ProfileMapperInstance;
  prototype: ProfileMapperInstance;
}

function createProfileMapper(): ProfileMapperConstructor {
  const Mapper = function ProfileMapper(
    this: ProfileMapperInstance,
    user: SamlProfile,
  ): ProfileMapperInstance {
    if (!(this instanceof Mapper)) {
      return new Mapper(user);
    }
    this._pu = user;
    return this;
  } as unknown as ProfileMapperConstructor;

  Mapper.prototype.metadata = ATTRIBUTE_METADATA;
  Mapper.prototype.getClaims = function getClaims(this: ProfileMapperInstance) {
    const claims: Record<string, string | string[]> = {};
    this.metadata.forEach((entry) => {
      const value = this._pu[entry.id as keyof SamlProfile] || "";
      claims[entry.id] = entry.multiValue
        ? String(value)
            .split(",")
            .map((part) => part.trim())
            .filter(Boolean)
        : String(value);
    });
    return claims;
  };
  Mapper.prototype.getNameIdentifier = function getNameIdentifier(
    this: ProfileMapperInstance,
  ) {
    return {
      nameIdentifier: this._pu.id,
      nameIdentifierFormat: NAME_ID_FORMAT,
    };
  };
  return Mapper;
}

export const ProfileMapper = createProfileMapper();
