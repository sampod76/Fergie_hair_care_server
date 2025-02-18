import { v4 as uuidV4, version as uuidVersion, validate } from 'uuid';
export const uuidGenerator = () => {
  // Generate a random UUID
  return crypto.randomUUID();
};

export class UuidBuilder {
  uuid: string;
  uuidType: 'crypto' | 'uuid';
  constructor(uidType: 'crypto' | 'uuid' = 'crypto') {
    this.uuidType = uidType;
    if (this.uuidType === 'crypto') {
      // Use crypto.randomUUID() for generating cryptographically secure UUIDs
      this.uuid = crypto.randomUUID();
    } else {
      // Use uuidV4() for generating version 4 UUIDs
      this.uuid = uuidV4();
    }
  }
  generateUuid(): string {
    if (this.uuidType === 'crypto') {
      return uuidGenerator();
    }
    // For 'v4' type, use uuidV4 from 'uuid' library
    return uuidV4();
  }
}

export class UuidUtls {
  readonly uuid: string;
  constructor(uuid: string) {
    this.uuid = uuid;
  }
  isUuidValid(): boolean {
    return validate(this.uuid);
  }

  getUuidVersion(): number {
    const version = uuidVersion(this.uuid);
    if (version > 0) {
      return version;
    }
    return 0;
  }
}
