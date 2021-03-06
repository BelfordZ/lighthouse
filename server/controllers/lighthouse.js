import 'babel-polyfill';
import winston from 'winston';
import winstonStream from 'winston-stream';
import elasticsearch from 'elasticsearch';
import rp from 'request-promise';
import pretty from 'prettysize';
import {claimSync} from '../utils/chainquery';
import {getStats} from '../utils/importer';

const loggerStream = winstonStream(winston, 'info');

const eclient = new elasticsearch.Client({
  host: process.env.ELASTIC_URL || 'http://localhost:9200',

  log: {
    level : 'info',
    type  : 'stream',
    stream: loggerStream,
  },
});

function getResults (input) {
  if (input.size === undefined) input.size = 10;
  if (input.from === undefined) input.from = 0;
  // Beamer - temp fix for https://github.com/lbryio/lighthouse/issues/67
  if (input.size > 10000) {
    input.size = 10000;
    input.from = 0;
  }
  if (input.from > 10000) {
    input.from = 9999;
    input.size = 1;
  }
  if (input.from + input.size > 10000) {
    input.from = 10000 - input.size;
  }
  return eclient.search({
    index  : 'claims',
    _source: ['name', 'value', 'claimId'],
    body   : {
      'query': {
        'bool': {
          'should': [
            {
              'match': {
                'bid_state': {
                  // Controlling claims should get higher placement in search results.
                  'query': 'Controlling',
                  'boost': 20,
                },
              },
            },
          ],
          'must': [
            {
              'bool': {
                'should': [
                  { // Match search text as phrase - Name
                    'match_phrase': {
                      'name': {
                        'query': input.s.trim(),
                        'boost': 10,
                      },
                    },
                  },
                  { // Match search text - Name
                    'match': {
                      'name': {
                        'query': input.s.trim(),
                        'boost': 5,
                      },
                    },
                  },
                  { // Contains search term - Name
                    'query_string': {
                      'query' : '*' + input.s.trim() + '*',
                      'fields': [
                        'name',
                      ],
                      'boost': 3,
                    },
                  },
                  {
                    'nested': {
                      'path' : 'value',
                      'query': {
                        'bool': {
                          'should': [
                            { // Contains search term in Author, Title, Description
                              'query_string': {
                                'query' : '*' + input.s.trim() + '*',
                                'fields': [
                                  'value.stream.metadata.author',
                                  'value.stream.metadata.title',
                                  'value.stream.metadata.description',
                                ],
                                'boost': 1,
                              },
                            },
                            { // Match search term - Author
                              'match': {
                                'value.stream.metadata.author': {
                                  'query': input.s.trim(),
                                  'boost': 2,
                                },
                              },
                            },
                            { // Match search text as phrase - Author
                              'match_phrase': {
                                'value.stream.metadata.author': {
                                  'query': input.s.trim(),
                                  'boost': 3,
                                },
                              },
                            },
                            { // Match search term - Title
                              'match': {
                                'value.stream.metadata.title': {
                                  'query': input.s.trim(),
                                  'boost': 2,
                                },
                              },
                            },
                            { // Match search text as phrase - Title
                              'match_phrase': {
                                'value.stream.metadata.title': {
                                  'query': input.s.trim(),
                                  'boost': 3,
                                },
                              },
                            },
                            { // Match search term - Description
                              'match': {
                                'value.stream.metadata.description': {
                                  'query': input.s.trim(),
                                  'boost': 2,
                                },
                              },
                            },
                            { // Match search text as phrase - Description
                              'match_phrase': {
                                'value.stream.metadata.description': {
                                  'query': input.s.trim(),
                                  'boost': 3,
                                },
                              },
                            },
                          ],
                        },
                      },
                    },
                  },
                ],
              },
            },
          ],
        },
      },
      size: input.size,
      from: input.from,
      sort: {
        _score: 'desc',
      },
    },
  });
}

function getIndex () {
  // ideally, data is inserted into elastic search with an index that helps us query it faster/better results
  // A simple start is to default queries to be within the n months, and to make a new index each month.

}

function getRoutingKey () {
  // This is the most important field for performance. Being able to route the queries ahead of time can make typedowns insanely good.

}

function getAutoCompleteQuery (query) {
  return {
    multi_match: {
      query         : query.s.trim(),
      type          : 'phrase_prefix',
      slop          : 5,
      max_expansions: 50,
      fields        : [
        'name',
        'value.stream.metadata.author',
        'value.stream.metadata.title',
        'value.stream.metadata.description',
      ],
    },
  };
}

function getFilter (query) {
  // this is the best place for putting things like filtering on the type of content
  // Perhaps we can add search param that will filter on how people have categorized / tagged their content

}

function getAutoComplete (query) {
  return eclient.search({
    index             : getIndex(query) || 'claims',
    routing           : getRoutingKey(query),
    ignore_unavailable: true, // ignore error when date index does not exist
    body              : {
      size : query.size || 5,
      from : query.from || 0,
      query: {
        bool: {
          must  : getAutoCompleteQuery(query),
          filter: getFilter(query),
        },
      },
    },
    size: query.size,
    from: query.from,
  });
}

function getStatus () {
  return new Promise((resolve, reject) => {
    rp(`http://localhost:9200/claims/_stats`)
      .then(function (data) {
        data = JSON.parse(data);
        resolve({status: getStats().info, spaceUsed: pretty(data._all.total.store.size_in_bytes, true), claimsInIndex: data._all.total.indexing.index_total, totSearches: data._all.total.search.query_total});
      })
      .catch(function (err) {
        reject(err);
      });
  });
}

class LighthouseControllers {
  /* eslint-disable no-param-reassign */
  // Start syncing blocks...
  startSync () {
    winston.log('info', '[Importer] Started importer, indexing claims.');
    claimSync();
    // sync(); // Old Sync
  }
  /**
   * Search API Endpoint.
   * @param {ctx} Koa Context
   */
  async search (ctx) {
    await getResults(ctx.query).then(function (result) {
      let results = result.hits.hits;
      let cResults = [];
      for (let pResult of results) {
        cResults.push(pResult._source);
      }
      ctx.body = cResults;
    });
  }

 /**
 * Autocomplete API Endpoint.
 * @param {ctx} Koa Context
 */
  async autoComplete (ctx) {
    await getAutoComplete(ctx.query).then(function (result) {
      let results = result.hits.hits;
      let cResults = [];
      for (let pResult of results) {
        cResults.push(pResult._source.name);
        if (pResult._source.value && pResult._source.value.stream !== undefined) {
          cResults.push(pResult._source.value.stream.metadata.title);
          cResults.push(pResult._source.value.stream.metadata.author);
        }
      }

      var clean = [];
      for (var i = 0; i < cResults.length; i++) {
        if (cResults[i] && cResults[i].length > 3 && clean.indexOf(cResults[i]) === -1) {
          clean.push(cResults[i]);
        }
      }

      ctx.body = clean;
    });
  }
  /**
   * Info about the api here
   * @param {ctx} Koa Context
   */
  async info (ctx) {
    ctx.redirect('https://github.com/lbryio/lighthouse');
  }

  /**
   * Status of the api here
   * @param {ctx} Koa Context
   */
  async status (ctx) {
    ctx.body = await getStatus();
  }

  /* eslint-enable no-param-reassign */
}

export default new LighthouseControllers();
