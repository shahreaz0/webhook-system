export interface MetadataItem {
  id: string;
  key: string;
  type: "string" | "number" | "boolean" | "object" | "array";
  value: string;
}

export function parseSingleMetadataItem(
  item: MetadataItem,
  key: string
): {
  val: any;
  error: string | null;
} {
  if (item.type === "number") {
    const num = Number(item.value);
    return { val: Number.isNaN(num) ? 0 : num, error: null };
  }
  if (item.type === "boolean") {
    return { val: item.value === "true", error: null };
  }
  if (item.type === "object") {
    try {
      const parsed = JSON.parse(item.value);
      if (
        typeof parsed !== "object" ||
        parsed === null ||
        Array.isArray(parsed)
      ) {
        return {
          val: null,
          error: `"${key}" value must be a valid JSON Object (e.g. {"key": "value"}).`,
        };
      }
      return { val: parsed, error: null };
    } catch {
      return {
        val: null,
        error: `"${key}" has invalid JSON Object format.`,
      };
    }
  }
  if (item.type === "array") {
    try {
      const parsed = JSON.parse(item.value);
      if (!Array.isArray(parsed)) {
        return {
          val: null,
          error: `"${key}" value must be a valid JSON Array (e.g. [1, 2, 3]).`,
        };
      }
      return { val: parsed, error: null };
    } catch {
      return {
        val: null,
        error: `"${key}" has invalid JSON Array format.`,
      };
    }
  }
  return { val: item.value, error: null };
}

export function parseMetadataItems(items: MetadataItem[]): {
  data: Record<string, any> | null;
  error: string | null;
} {
  const metadataObj: Record<string, any> = {};
  for (const item of items) {
    const trimmedKey = item.key.trim();
    if (!trimmedKey) {
      continue;
    }
    if (trimmedKey in metadataObj) {
      return {
        data: null,
        error: `Duplicate metadata key found: "${trimmedKey}"`,
      };
    }

    const { val, error } = parseSingleMetadataItem(item, trimmedKey);
    if (error) {
      return { data: null, error };
    }
    metadataObj[trimmedKey] = val;
  }
  return { data: metadataObj, error: null };
}

export function getMetadataType(
  value: any
): "string" | "number" | "boolean" | "object" | "array" {
  if (typeof value === "number") {
    return "number";
  }
  if (typeof value === "boolean") {
    return "boolean";
  }
  if (Array.isArray(value)) {
    return "array";
  }
  if (typeof value === "object" && value !== null) {
    return "object";
  }
  return "string";
}

export function getMetadataStringValue(value: any, type: string): string {
  if (type === "object" || type === "array") {
    return JSON.stringify(value);
  }
  return String(value);
}

export function getDefaultValueForType(
  type: "string" | "number" | "boolean" | "object" | "array"
): string {
  switch (type) {
    case "boolean":
      return "false";
    case "number":
      return "";
    case "object":
      return "{}";
    case "array":
      return "[]";
    default:
      return "";
  }
}
