export type ParsedDiffLineType = "context" | "add" | "delete" | "metadata";

export type ParsedDiffLine = {
  oldLine: number | null;
  newLine: number | null;
  type: ParsedDiffLineType;
  code: string;
};

export type ParsedDiffFile = {
  oldPath: string | null;
  newPath: string | null;
  displayPath: string;
  isNewFile: boolean;
  isDeletedFile: boolean;
  isBinary: boolean;
  lines: ParsedDiffLine[];
};

const DIFF_HEADER_PATTERN = /^diff --git "?a\/(.+?)"? "?b\/(.+?)"?$/;
const HUNK_HEADER_PATTERN = /^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/;

export function parseUnifiedDiff(diffText: string): ParsedDiffFile[] {
  if (!diffText.trim()) {
    return [];
  }

  const files: ParsedDiffFile[] = [];
  let currentFile: ParsedDiffFile | null = null;
  let oldLine = 0;
  let newLine = 0;

  const ensureFile = () => {
    if (!currentFile) {
      currentFile = createDiffFile();
      files.push(currentFile);
    }

    return currentFile;
  };

  for (const rawLine of diffText.split(/\r?\n/)) {
    const diffHeaderMatch = rawLine.match(DIFF_HEADER_PATTERN);

    if (diffHeaderMatch) {
      currentFile = createDiffFile({
        oldPath: diffHeaderMatch[1],
        newPath: diffHeaderMatch[2],
      });
      currentFile.lines.push(createMetadataLine(rawLine));
      files.push(currentFile);
      oldLine = 0;
      newLine = 0;
      continue;
    }

    const file = ensureFile();

    if (rawLine.startsWith("--- ")) {
      file.oldPath = normalizeDiffPath(rawLine.slice(4));
      file.isNewFile = file.oldPath === null;
      file.displayPath = getDisplayPath(file);
      file.lines.push(createMetadataLine(rawLine));
      continue;
    }

    if (rawLine.startsWith("+++ ")) {
      file.newPath = normalizeDiffPath(rawLine.slice(4));
      file.isDeletedFile = file.newPath === null;
      file.displayPath = getDisplayPath(file);
      file.lines.push(createMetadataLine(rawLine));
      continue;
    }

    if (isMetadataLine(rawLine)) {
      if (
        rawLine.startsWith("Binary files ") ||
        rawLine === "GIT binary patch"
      ) {
        file.isBinary = true;
      }

      if (rawLine.startsWith("new file mode")) {
        file.isNewFile = true;
      }

      if (rawLine.startsWith("deleted file mode")) {
        file.isDeletedFile = true;
      }

      file.lines.push(createMetadataLine(rawLine));
      continue;
    }

    const hunkMatch = rawLine.match(HUNK_HEADER_PATTERN);
    if (hunkMatch) {
      oldLine = Number(hunkMatch[1]);
      newLine = Number(hunkMatch[2]);
      file.lines.push(createMetadataLine(rawLine));
      continue;
    }

    if (rawLine.startsWith("+")) {
      file.lines.push({
        oldLine: null,
        newLine,
        type: "add",
        code: rawLine.slice(1),
      });
      newLine += 1;
      continue;
    }

    if (rawLine.startsWith("-")) {
      file.lines.push({
        oldLine,
        newLine: null,
        type: "delete",
        code: rawLine.slice(1),
      });
      oldLine += 1;
      continue;
    }

    const code = rawLine.startsWith(" ") ? rawLine.slice(1) : rawLine;
    file.lines.push({
      oldLine: oldLine || null,
      newLine: newLine || null,
      type: "context",
      code,
    });

    if (oldLine > 0) {
      oldLine += 1;
    }

    if (newLine > 0) {
      newLine += 1;
    }
  }

  return files.filter(
    (file) =>
      file.lines.length > 0 || file.oldPath !== null || file.newPath !== null,
  );
}

function createDiffFile(paths?: {
  oldPath?: string | null;
  newPath?: string | null;
}): ParsedDiffFile {
  const file = {
    oldPath: paths?.oldPath ?? null,
    newPath: paths?.newPath ?? null,
    displayPath: "Proposed changes",
    isNewFile: false,
    isDeletedFile: false,
    isBinary: false,
    lines: [],
  };

  file.displayPath = getDisplayPath(file);

  return file;
}

function createMetadataLine(code: string): ParsedDiffLine {
  return {
    oldLine: null,
    newLine: null,
    type: "metadata",
    code,
  };
}

function normalizeDiffPath(value: string) {
  const path = value.trim();

  if (path === "/dev/null") {
    return null;
  }

  return path.replace(/^[ab]\//, "");
}

function getDisplayPath(file: Pick<ParsedDiffFile, "newPath" | "oldPath">) {
  return file.newPath || file.oldPath || "Proposed changes";
}

function isMetadataLine(line: string) {
  return (
    line.startsWith("index ") ||
    line.startsWith("old mode ") ||
    line.startsWith("new mode ") ||
    line.startsWith("deleted file mode ") ||
    line.startsWith("new file mode ") ||
    line.startsWith("similarity index ") ||
    line.startsWith("dissimilarity index ") ||
    line.startsWith("rename from ") ||
    line.startsWith("rename to ") ||
    line.startsWith("copy from ") ||
    line.startsWith("copy to ") ||
    line.startsWith("Binary files ") ||
    line === "GIT binary patch" ||
    line.startsWith("literal ") ||
    line.startsWith("delta ") ||
    line === "\\ No newline at end of file"
  );
}
