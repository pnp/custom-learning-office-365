# JSON Schemas
There are 3 main files used for configuring Microsoft 365 Learning Pathways. These are JSON files. Here is the documentation for the schema of those files.

## Metadata.json Schema
Overview
--------
This document describes the JSON structure used by the Microsoft 365 Learning Pathways `metadata.json`. It documents the top-level properties, object shapes, field types, cardinality, common constraints and cross-references.

Top-level structure
-------------------
The file is a single JSON object with these top-level properties:

- `Technologies`: array of Technology objects
- `Categories`: array of Category objects (hierarchical via `SubCategories`)
- `Audiences`: array of Audience objects
- `Sources`: array of strings (source keys)
- `Levels`: array of Level objects
- `StatusTag`: array of StatusTag objects

Common conventions
------------------
- `Id`: GUID string (used as a stable identifier and cross-reference key).
- `Name`: human-friendly string.
- Many reference fields may be an empty string to indicate "no link" (e.g., `TechnologyId` sometimes is "").
- Image paths are relative URLs (e.g., `images/categories/excel.png`).
- Arrays are used even when empty.

Definitions
-----------

Technologies (array)
- Type: array of Technology objects
- Technology:
  - `Id` (string, GUID) — unique identifier for this technology.
  - `Name` (string)
  - `Subjects` (array of Subject) — may be empty.

Subject:
  - `Id` (string, GUID) — unique identifier for the subject.
  - `Name` (string)

Categories (array)
- Type: array of Category objects
- Category:
  - `Id` (string, GUID)
  - `Name` (string)
  - `Image` (string) — relative path or empty string.
  - `TechnologyId` (string) — GUID referring to `Technologies[].Id` or empty string.
  - `SubjectId` (string) — GUID referring to a subject `Technologies[].Subjects[].Id` or empty string.
  - `Source` (string) — should be one of the top-level `Sources` values (e.g., "Microsoft").
  - `SubCategories` (array of Category) — recursion for nested categories. Subcategory objects may include additional optional fields such as `StatusTagId`.
  - Optional: `StatusTagId` (string) — GUID referencing an entry in `StatusTag[].Id`.

Audiences (array)
- Type: array of Audience objects
- Audience:
  - `Id` (string, GUID)
  - `Name` (string)

Sources (array)
- Type: array of strings
- Example values: `SOC`, `FastTrack`, `M365`, `Microsoft`, `LinkedIn`.

Levels (array)
- Type: array of Level objects
- Level:
  - `Id` (string, GUID)
  - `Name` (string) — e.g., `Beginner`, `Intermediate`, `Advanced`.

StatusTag (array)
- Type: array of StatusTag
- StatusTag:
  - `Id` (string, GUID)
  - `Name` (string) — e.g., `Beta`, `Retired`, `Updated`, `New`, `Active`.

Cross-reference rules and validation hints
-----------------------------------------
- When present, `TechnologyId` should match a `Technologies[].Id` value.
- When present, `SubjectId` should match a `Categories[].Subjects[].Id` within the matched technology, or be globally unique depending on implementation.
- `StatusTagId` should match an `StatusTag[].Id`.
- `Source` should be one of the `Sources` strings; if not, consider adding it to `Sources` or normalizing the value.

Example snippets
----------------
Technology example:

```
{
  "Id": "c15c2729-22b4-464b-ba9a-1052d88e2bf4",
  "Name": "SharePoint",
  "Subjects": [ { "Id": "2324ad0f-...", "Name": "Site Branding and Customization" } ]
}
```

Category example (with subcategory):

```
{
  "Id": "646b4eb4-32c0-4fdc-93fa-0ef895470b74",
  "Name": "Get started",
  "Image": "",
  "TechnologyId": "",
  "SubjectId": "",
  "Source": "Microsoft",
  "SubCategories": [
    {
      "Id": "b40d7a3e-9357-4a03-84b4-fa98e2dbfe13",
      "Name": "Transform your work week",
      "Image": "images/categories/action_sparkle.png",
      "TechnologyId": "44c7891e-fc61-4148-88b1-e04c2e3ccf32",
      "SubjectId": "",
      "Source": "Microsoft",
      "SubCategories": []
    }
  ]
}
```

## Playlists.json Schema

Overview
--------
This file documents the JSON structure used by the `playlists.json`. The file is an array of playlist objects where each object groups a set of related learning assets.

Top-level structure
-------------------
- Root: JSON array of Playlist objects.

Playlist object
---------------
Fields commonly present (types and notes):

- `Id` (string, GUID) — unique identifier for the playlist.
- `Title` (string) — human-facing playlist title.
- `Image` (string) — relative path to a playlist image (e.g., `images/playlists/...`).
- `LevelId` (string, GUID) — references an entry in `Levels[].Id` or empty string.
- `AudienceId` (string, GUID) — references an entry in `Audiences[].Id`.
- `TechnologyId` (string, GUID) — references `Technologies[].Id` or empty string.
- `SubjectId` (string) — references a `Technologies[].Subjects[].Id` or empty string.
- `Source` (string) — source name, typically one of `Sources` (e.g., `Microsoft`).
- `CatId` (string, GUID) — category id referencing `Categories[].Id` or a subcategory id.
- `Description` (string) — human-readable description of the playlist.
- `StatusTagId` (string, GUID) — optional; references `StatusTag[].Id` or empty string.
- `StatusNote` (string) — optional free-text note associated with the status.
- `Assets` (array of strings, GUIDs) — ordered list of asset IDs included in the playlist.

Common conventions and constraints
--------------------------------
- Many reference fields use empty strings to indicate "no value" rather than null.
- `Assets` contains IDs that correspond to entries in the global assets list used across the learning pathways content (not included in this file).
- The array order in `Assets` is meaningful (it defines the playlist order).

Example playlist entry
----------------------
```
{
  "Id": "959166d8-1cb7-4315-af20-541598ebecaa",
  "Title": "Six Simple Steps - Welcome to Microsoft 365",
  "Image": "images/playlists/six_simple_steps_-_welcome_to_office_365.png",
  "LevelId": "728fc9bd-0e13-4b9f-a7b5-51bd1f01c524",
  "AudienceId": "82a23325-2e47-4ff9-8747-b6e01c452b81",
  "TechnologyId": "0ae04ffb-5e69-461d-919d-a2215109bf49",
  "SubjectId": "",
  "Source": "Microsoft",
  "CatId": "9bde32c3-2f0b-4201-b4a3-74cef2c8f61d",
  "Description": "Get started with Microsoft 365 in six simple steps...",
  "StatusTagId": "dda75593-7969-4d64-bff1-1c21bb2d8c8b",
  "StatusNote": "",
  "Assets": [ "365-378767af-7ac3-4d68-9d0f-709b6948a76b", "1fa93876-0318-4622-b473-142a3bfd6495" ]
}
```

Validation guidance
--------------------
- Ensure `LevelId`, `AudienceId`, `TechnologyId`, `CatId`, and `StatusTagId` map to existing entries in `metadata.json` (`Audiences`, `Levels`, `Categories`).
- Confirm every `Assets` entry exists in the project's asset registry (or the assets file you maintain).

## Assets.json Schema

Overview
--------
This document describes the structure of `assets.json`. The file is a JSON array where each element is an Asset object describing a single learning resource.

Top-level structure
-------------------
- Root: JSON array of Asset objects.

Asset object
------------
Common fields observed in the file (types and notes):

- `Id` (string, GUID) — unique identifier for the asset.
- `Title` (string) — human-facing title of the asset.
- `Description` (string) — short description; often empty.
- `Url` (string) — link to the resource (often an external Microsoft support or video URL). Embedded query params like `embed=true` are common.
- `TechnologyId` (string, GUID) — optional reference to an entry in `Technologies[].Id` (may be empty string).
- `SubjectId` (string) — optional reference to a `Technologies[].Subjects[].Id` (may be empty string).
- `Source` (string) — source name, typically one of `Sources` in `metadata.json` (e.g., `Microsoft`).
- `StatusTagId` (string, GUID) — optional; references `StatusTag[].Id` or empty string.
- `StatusNote` (string) — optional free-text note associated with the status (often empty).

Conventions and validation hints
--------------------------------
- Use empty strings for optional reference fields to match existing file patterns.
- Validate that `TechnologyId`, `SubjectId`, and `StatusTagId` (when present) match entries in `metadata.json`.
- Confirm each `Url` is reachable and uses the expected host(s) for your content (e.g., `support.office.com`, `www.youtube.com`, etc.). Enure that the url can be accessible via an IFrame by testing it in Learning Pathways first. 

Example asset entry
-------------------
```
{
  "Id": "0d9f6fd5-6b0c-45a2-a0aa-0576ae1f6895",
  "Title": "Monitor engagement in Viva Engage with analytics",
  "Description": "",
  "Url": "https://support.office.com/en-us/f1/article/0d9f6fd5-6b0c-45a2-a0aa-0576ae1f6895?embed=true&themeid=-1",
  "TechnologyId": "",
  "SubjectId": "",
  "Source": "Microsoft",
  "StatusTagId": "",
  "StatusNote": ""
}
```

