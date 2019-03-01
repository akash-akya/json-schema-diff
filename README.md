# Json Schema Diff
> A language agnostic CLI tool and nodejs api to identify differences between two json schema files.

## Requirements
- nodejs 6.x or higher (tested using 6.x, 8.x, 10.x and 11.x)
- npm 3.x or higher (tested using 3.x and 6.x)

## Installation

Install the tool using npm and add it to the package.json   
```
npm install json-schema-diff --save-dev
```

## Description

This tool identifies what has changed between two json schema files.
These changes are classified into two groups, added and removed. Using an approach based on set theory this tool is able to calculate these differences to a high level of accuracy.

[KEYWORDS.md](KEYWORDS.md) contains the details of what json schema keywords are supported.

A change is considered an addition when the destination schema has become more permissive relative to the source schema. For example `{"type": "string"}` -> `{"type": ["string", "number"]}`.


A change is considered a removal when the destination schema has become more restrictive relative to the source schema. For example `{"type": ["string", "number"]}` -> `{"type": "string"}`.

The addition and removal changes detected are returned in JsonSchema format. These schemas represent the set of values that have been added or removed.

### Example

#### Source Schema
```
{
    "properties": {
        "id": {
            "type": "number"
        }
    },
    "type": "object"
}
```

#### Destination Schema
```
{
    "properties": {
        "id": {
            "type": ["string", "number"]
        }
    },
    "type": "object"
}
```

#### Schema representing what was added
All objects that contain an id property of type string. The id property is required because both source and destination schemas accept objects without an id property, so we want to exclude those objects from the added result.
```
{
    "properties": {
        "id": {
            "type": "string"
        }
    },
    "required": ["id"],
    "type": "object"
}
```

#### Schema representing what was removed
All values accepted by the source schema are also accepted by the destination schema, so the removed result is a schema that accepts no values.
```
false
```

## Usage

### Usage as a cli tool

Invoke the tool with a file path to the source schema file and the destination schema file. 
These files should be in JSON format and be valid according to the json schema draft-07 specification.

The tool will return two json schemas as output, one representing the values that were added by the destination schema and the other representing the values that were removed by the destination schema. 
 
The tool will fail if any removed differences are detected.

#### Example
*/path/to/source-schema.json*
```
{
  "type": "string"
}
```

*/path/to/destination-schema.json*
```
{
  "type": ["string", "number"]
}
```
*Invoking the tool*
```
json-schema-diff /path/to/source-schema.json /path/to/destination-schema.json
```
*Output*
```
Non-breaking changes found between the two schemas.

Values described by the following schema were added:
{
    "type": [
        "number"
    ]
}

Values described by the following schema were removed:
false
```


### Usage as a nodejs api

Invoke the library with the source schema and the destination schema. 
These objects should be simple javascript objects and be valid according to the json schema draft-07 specification.

For full details of the nodejs api please refer to [api-types.d.ts](lib/api-types.d.ts)

#### Example

```
const jsonSchemaDiff = require('json-schema-diff');

const source = {type: 'string'};
const destination = {type: ['string', 'number']};

const result = await jsonSchemaDiff.diffSchemas({
    sourceSchema: source, 
    destinationSchema: destination
});

if (result.removalsFound) {
    console.log('Something was removed!');
}

if (result.additionsFound) {
    console.log('Something was added!');
}
```

## Changelog
See [CHANGELOG.md](CHANGELOG.md)

## Contributing
See [CONTRIBUTING.md](CONTRIBUTING.md)

## License
See [LICENSE.txt](LICENSE.txt)
