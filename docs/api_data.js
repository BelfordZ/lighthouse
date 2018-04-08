define({ "api": [
  {
    "type": "get",
    "url": "/autocomplete",
    "title": "Autocomplete API",
    "group": "Search",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "s",
            "description": "<p>The text to be autocompleted (Required).</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Example",
          "content": "http://localhost/autocomplete?s=fillerino",
          "type": "url"
        }
      ]
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Array[]",
            "optional": false,
            "field": "array",
            "description": "<p>List of search response, each containing the value below.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n\n[\"@Fillerino\",\"fillerino-js-test\",\"Text Javascript Injection\"]",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "server/routes/lighthouse.js",
    "groupTitle": "Search",
    "name": "GetAutocomplete",
    "sampleRequest": [
      {
        "url": "https://lighthouse.lbry.io/autocomplete"
      }
    ]
  },
  {
    "type": "get",
    "url": "/search",
    "title": "Main Search API",
    "group": "Search",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "s",
            "description": "<p>The search text (Required)</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "size",
            "description": "<p>Amount of results to return as max</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "from",
            "description": "<p>The number to start from, good for pagination.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Example",
          "content": "http://localhost/search?s=fillerino",
          "type": "url"
        }
      ]
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Array[]",
            "optional": false,
            "field": "array",
            "description": "<p>List of search response, each containing the value below.</p>"
          },
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "result",
            "description": "<p>A search result</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "result.name",
            "description": "<p>The name of the claim.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "result.claimId",
            "description": "<p>The claimId of the claim.</p>"
          },
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "result.value",
            "description": "<p>The decoded value of the metadata</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success",
          "content": "   HTTP/1.1 200 OK\n[\n  {\n    \"name\":\"fillerino-js-test\",\n    \"claimId\":\"7bfed722c678a0e0ceb9fb90974bfcc65f528813\",\n    \"value\":{\n      \"version\":\"_0_0_1\",\n      \"claimType\":\"streamType\",\n      \"stream\":{\n        \"source\":{\n          \"source\":\"7ded8c9c7527fce26ced886adcd2eab9fc424c0126eff6572f0615ab66ec3bfbdbbfc1603d95cecd81c9b93fa8ecfbf8\",\n          \"version\":\"_0_0_1\",\n          \"contentType\":\"text/html\",\n          \"sourceType\":\"lbry_sd_hash\"\n        },\n        \"version\":\"_0_0_1\",\n        \"metadata\":{\n          \"license\":\"Public Domain\",\n          \"description\":\"A test file which tries to communicate with the daemon(from inside the app).\",\n          \"language\":\"en\",\n          \"title\":\"Text Javascript Injection\",\n          \"author\":\"\",\n          \"version\":\"_0_1_0\",\n          \"nsfw\":false,\n          \"licenseUrl\":\"\",\n          \"preview\":\"\",\n          \"thumbnail\":\"\"\n        }\n      }\n    }\n  },\n  {...},\n  {...}\n]",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "server/routes/lighthouse.js",
    "groupTitle": "Search",
    "name": "GetSearch",
    "sampleRequest": [
      {
        "url": "https://lighthouse.lbry.io/search"
      }
    ]
  },
  {
    "type": "get",
    "url": "/status",
    "title": "Status",
    "group": "Search",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Array[]",
            "optional": false,
            "field": "array",
            "description": "<p>Will contain information about lighthouse.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n\n{\"err\": \"Not done yet, will be added\"}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "server/routes/lighthouse.js",
    "groupTitle": "Search",
    "name": "GetStatus",
    "sampleRequest": [
      {
        "url": "https://lighthouse.lbry.io/status"
      }
    ]
  }
] });
