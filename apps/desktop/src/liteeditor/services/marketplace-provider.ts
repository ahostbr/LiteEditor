// @ts-nocheck
import {
  INTEGRATION_SPECS,
  type IntegrationId,
  type IntegrationManifest,
} from "./integrations-types";

interface GalleryFile {
  assetType?: string;
  source?: string;
}

interface GalleryProperty {
  key?: string;
  value?: string;
}

interface GalleryVersion {
  version?: string;
  lastUpdated?: string;
  targetPlatform?: string;
  files?: GalleryFile[];
  properties?: GalleryProperty[];
  assetUri?: string;
}

interface GalleryExtension {
  publisher?: { publisherName?: string };
  extensionName?: string;
  extensionId?: string;
  assetUri?: string;
  versions?: GalleryVersion[];
}

interface GalleryResponse {
  results?: Array<{
    extensions?: GalleryExtension[];
  }>;
}

const MARKETPLACE_QUERY_URL =
  "https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery";
const MARKETPLACE_API_VERSION = "7.2-preview.1";

export class MarketplaceProvider {
  async fetchLatestManifest(id: IntegrationId): Promise<IntegrationManifest> {
    const spec = INTEGRATION_SPECS[id];
    const payload = {
      filters: [
        {
          criteria: [
            { filterType: 7, value: spec.extensionId },
            { filterType: 8, value: "Microsoft.VisualStudio.Code" },
          ],
          pageNumber: 1,
          pageSize: 1,
          sortBy: 0,
          sortOrder: 0,
        },
      ],
      // Include full version metadata, files and properties for robust platform selection.
      flags: 32767,
    };

    const response = await fetch(
      `${MARKETPLACE_QUERY_URL}?api-version=${MARKETPLACE_API_VERSION}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: `application/json;api-version=${MARKETPLACE_API_VERSION}`,
          "X-Market-Client-Id": "LiteEditor",
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      throw new Error(`Marketplace query failed (${response.status})`);
    }

    const body = (await response.json()) as GalleryResponse;
    const extension = body.results?.[0]?.extensions?.[0];
    if (!extension) {
      throw new Error(`Marketplace extension not found: ${spec.extensionId}`);
    }

    const version = this.pickVersion(extension.versions);
    if (!version?.version) {
      throw new Error(`Marketplace returned no versions for ${spec.extensionId}`);
    }

    const downloadUrl = this.resolveVsixUrl(extension, version);
    if (!downloadUrl) {
      throw new Error(`Marketplace returned no VSIX download URL for ${spec.extensionId}`);
    }

    const publisher = (extension.publisher?.publisherName || "").trim().toLowerCase();
    const name = (extension.extensionName || "").trim().toLowerCase();
    if (publisher !== spec.publisher || name !== spec.name) {
      throw new Error(
        `Marketplace identity mismatch for ${spec.extensionId}: got ${publisher}.${name}`,
      );
    }

    const sha256 = this.extractSha256(version.properties ?? []);
    const publishedAt = version.lastUpdated ? Date.parse(version.lastUpdated) : null;

    return {
      extensionId: spec.extensionId,
      publisher,
      name,
      version: version.version,
      targetPlatform: this.normalizeTargetPlatform(version.targetPlatform),
      downloadUrl,
      sha256,
      publishedAt: Number.isFinite(publishedAt) ? publishedAt : null,
    };
  }

  private pickVersion(versions: GalleryVersion[] | undefined): GalleryVersion | null {
    if (!versions || versions.length === 0) return null;
    const hostTarget = this.getHostTargetPlatform();
    const allCandidates = [...versions].filter(
      (entry) => typeof entry.version === "string" && entry.version.trim().length > 0,
    );

    const compatibleCandidates = allCandidates.filter((entry) =>
      this.isCompatibleTargetPlatform(entry.targetPlatform, hostTarget),
    );

    const rankedCandidates = (
      compatibleCandidates.length > 0 ? compatibleCandidates : allCandidates
    ).sort((a, b) => {
      const versionScore = this.compareVersions(a.version ?? "0", b.version ?? "0");
      if (versionScore !== 0) return versionScore;
      return (
        this.targetPlatformScore(a.targetPlatform, hostTarget) -
        this.targetPlatformScore(b.targetPlatform, hostTarget)
      );
    });

    return rankedCandidates.pop() ?? null;
  }

  private resolveVsixUrl(extension: GalleryExtension, version: GalleryVersion): string | null {
    const fromFiles = version.files?.find((file) => {
      const type = (file.assetType || "").toLowerCase();
      return type.includes("vsixpackage");
    })?.source;

    if (fromFiles) return fromFiles;

    if (version.assetUri) {
      return `${version.assetUri}/Microsoft.VisualStudio.Services.VSIXPackage`;
    }

    if (extension.assetUri && version.version) {
      return `${extension.assetUri}/${version.version}/Microsoft.VisualStudio.Services.VSIXPackage`;
    }

    return null;
  }

  private extractSha256(properties: GalleryProperty[]): string | null {
    const candidates = properties
      .filter((property) => typeof property.key === "string" && typeof property.value === "string")
      .map((property) => ({ key: property.key!.toLowerCase(), value: property.value!.trim() }));

    const directSha = candidates.find((property) => property.key.includes("sha256"));
    if (directSha?.value) return directSha.value;

    const packageHash = candidates.find((property) => property.key.includes("packagehash"));
    if (packageHash?.value) return packageHash.value;

    return null;
  }

  private compareVersions(a: string, b: string): number {
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
  }

  private getHostTargetPlatform(): string {
    switch (process.platform) {
      case "win32":
        if (process.arch === "arm64") return "win32-arm64";
        if (process.arch === "ia32") return "win32-ia32";
        return "win32-x64";
      case "darwin":
        return process.arch === "arm64" ? "darwin-arm64" : "darwin-x64";
      case "linux":
        return process.arch === "arm64" ? "linux-arm64" : "linux-x64";
      default:
        return `${process.platform}-${process.arch}`;
    }
  }

  private normalizeTargetPlatform(value: string | undefined): string | null {
    if (!value || value.trim().length === 0) return null;
    return value.trim().toLowerCase();
  }

  private targetPlatformScore(candidate: string | undefined, hostTarget: string): number {
    const normalized = this.normalizeTargetPlatform(candidate);

    if (normalized === hostTarget) return 100;
    if (!normalized) return 90;

    const hostFamily = hostTarget.split("-")[0];
    const candidateFamily = normalized.split("-")[0];
    if (hostFamily === candidateFamily) return 70;

    return 10;
  }

  private isCompatibleTargetPlatform(candidate: string | undefined, hostTarget: string): boolean {
    const normalized = this.normalizeTargetPlatform(candidate);
    if (!normalized) return true;
    return normalized === hostTarget;
  }
}
