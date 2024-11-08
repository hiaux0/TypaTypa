import { describe, expect, test } from "vitest";
import {
    KeyMappingService,
    overwriteAndAddExistingKeyBindingsV2
} from "../../src/features/vim/vimCore/commands/KeyMappingService";
import { current, additional } from "./KeyMappingService.spec";

describe("KeyMappingService", () => {
    test("mergeKeybindingsV2", () => {
        const keyMappingService = new KeyMappingService();
        const result = keyMappingService.mergeKeybindingsV2(current, additional);
        /*prettier-ignore*/ console.log("[KeyMappingService.spec.ts,996] result: ", result);
        expect(result).toBe(true);
    });

    test.only("overwriteExistingKeyBindingsV2", () => {
        const result = overwriteAndAddExistingKeyBindingsV2();
        expect(result).toBe(true);
    });
});

