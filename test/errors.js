/*jslint node: true*/
var assert = require('chai').assert;
var fs = require('fs');
var $rdf = require('rdflib');
var request = require('request');
var S = require('string');
var supertest = require('supertest');
var async = require('async');

// Helper functions for the FS
var rm = require('./test-utils').rm;
var write = require('./test-utils').write;
var cp = require('./test-utils').cp;
var read = require('./test-utils').read;

var ldnode = require('../index');
var ACL = require('../lib/acl').ACL;
var ns = require('../lib/vocab/ns.js').ns;

describe('Error pages', function() {

    // LDP with error pages
    var errorLdp = ldnode({
        root: __dirname + '/resources',
        errorPages: __dirname + '/resources/errorPages'
    });
    var errorServer = supertest(errorLdp);

    // LDP with no error pages
    var noErrorLdp = ldnode({
        root: __dirname + '/resources',
        noErrorPages: true
    });
    var noErrorServer = supertest(noErrorLdp);

    function defaultErrorPage(filepath, expected) {
        var handler = function (res) {
            var errorFile = read(filepath);
            if (res.text === errorFile && !expected){
                console.log("Not default text");
            }
        };
        return handler;
    }

    describe('noErrorPages', function () {
        var file404 = 'errorPages/404.html';
        it('Should return 404 express default page', function(done) {
            noErrorServer.get('/non-existent-file.html')
                .expect(defaultErrorPage(file404, false))
                .expect(404, done);
        });
    });

    describe('errorPages set', function() {
        var file404 = 'errorPages/404.html';
        it('Should return 404 custom page if exists', function(done) {
            errorServer.get('/non-existent-file.html')
                .expect(defaultErrorPage(file404, true))
                .expect(404, done);
        });
    });
});
