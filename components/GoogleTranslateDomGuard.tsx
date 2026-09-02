"use client";

import { useEffect } from "react";

/**
 * Google Translate (and browser-native page translation) rewrites DOM text
 * nodes directly, bypassing React. When React later tries to remove/insert
 * a node it thinks is still there, the browser throws:
 *
 *   NotFoundError: Failed to execute 'removeChild' on 'Node': The node to
 *   be removed is not a child of this node.
 *
 * ...which crashes the whole React tree. This is a well-documented, long-
 * standing issue (facebook/react#11538) with no official framework-level
 * fix. The standard production workaround is to patch removeChild/
 * insertBefore to fail gracefully (log + no-op) instead of throwing when
 * the DOM has been mutated out from under React by something external.
 *
 * This must run once, as early as possible on the client, before Google
 * Translate has a chance to touch the page.
 */
export default function GoogleTranslateDomGuard() {
    useEffect(() => {
        if (typeof Node !== "function" || !Node.prototype) return;

        // Avoid double-patching if this component ever mounts twice
        // (e.g. React StrictMode double-invokes effects in development).
        if ((Node.prototype as any).__aspireTranslateGuardApplied) return;
        (Node.prototype as any).__aspireTranslateGuardApplied = true;

        const originalRemoveChild = Node.prototype.removeChild;
        Node.prototype.removeChild = function <T extends Node>(this: Node, child: T): T {
            if (child.parentNode !== this) {
                console.warn(
                    "[GoogleTranslateDomGuard] Skipped removeChild — node was already moved (likely by page translation)."
                );
                return child;
            }
            return originalRemoveChild.call(this, child) as T;
        } as typeof Node.prototype.removeChild;

        const originalInsertBefore = Node.prototype.insertBefore;
        Node.prototype.insertBefore = function <T extends Node>(
            this: Node,
            newNode: T,
            referenceNode: Node | null
        ): T {
            if (referenceNode && referenceNode.parentNode !== this) {
                console.warn(
                    "[GoogleTranslateDomGuard] Skipped insertBefore — reference node was already moved (likely by page translation)."
                );
                return newNode;
            }
            return originalInsertBefore.call(this, newNode, referenceNode) as T;
        } as typeof Node.prototype.insertBefore;
    }, []);

    return null;
}
