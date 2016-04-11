define([
    'backbone',
    'base/baseModel'
], function(Backbone, BaseModel) {
    'use strict';

    return BaseModel.extend({

        urlRoot: window.getapi('rrp', '/userIndic')

    });

});