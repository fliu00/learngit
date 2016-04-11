define([
    'lodash',
    'marionette',

    'achy/widget/ui/modal',

    './itemView.tpl',
    './modal/index',
    'notify',
    'peity'
], function(_, Marionette, Modal, itemViewTpl, IndicatorModal) {
    'use strict';

    return Marionette.ItemView.extend({

        tagName: 'tr',

        template: itemViewTpl,

        events: {
            'click .set-top': '_toggleStar',
            'click .icon-remove': '_remove',
            'click .name': '_showModal',
            'click .load-chart': '_showModal'
        },

        serializeData: function() {
            var data = this.model.toJSON(),
                keys = ['indicName','isNew', 'dataValue', 'unit', 'frequency', 'dataSource'];

            data.isHeadline = data.isHeadline ? true : false;
            var isNewTem = data.isNew;
            if (data.dataValue) {
                data.dataValue = data.dataValue.toFixed(2);
            }
            // init data
            _.each(keys, function(key) {
                data[key] = data[key] || '-';
            });
            data.isNew = isNewTem;
            return data;
        },

        initialize: function() {
            this.listenTo(this.model, 'change', this.render);
        },

        onRender: function() {
            var self = this;
            $.ajax({
                url: window.getapi('rrp', '/industryDetail'),
                type: 'GET',
                data: {
                    indicID: this.model.attributes.indicId
                }
            })
            .done(function(response) {
                if(!response || !response.data){
                    self.$el.find(".load-chart").html("-");
                }
                else{
                    var arr = [];
                    _.each(response.data.data, function(data){
                        arr.push(data.dataValue);
                    });
                    self.$el.find(".load-chart").html("<span class='line'>" + arr.join(",") + "</span>");
                    self.$el.find(".load-chart .line").peity("line", {
                        width: 105,
                        stroke: '#00b9e5',
                        fill: '#d5f2fa'
                    });
                }
            });
            this.$el.find('.has-tooltip').tooltip();
        },

        _toggleStar: function(e) {
            var self = this,
                id = this.model.get('id'),
                isHeadline = this.model.get('isHeadline') ? false : true;

            // if the api can be /userIndic/{id}
            // use this.model.save() instead
            $.ajax({
                url: window.getapi('rrp', '/userIndic'),
                type: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify({
                    id: id,
                    isHeadline: isHeadline
                })
            })
            .done(function(response) {
                if (response.code === 1) {
                    var data = response.data;

                    self.model.set('isHeadline', data.isHeadline);
                    self.model.set('updateTime', data.updateTime);
                } else if (response.code === -21) {
                    $(e.currentTarget).notify('最多只可定义三个常用数据', {
                        position: 'left',
                        className: 'warn',
                        autoHideDelay: 2000,
                        showAnimation: 'fadeIn',
                        hideAnimation: 'fadeOut'
                    });
                }
            });
        },

        _remove: function() {
            var self = this;

            Modal.Confirm({
                title: '操作确认',
                content: '确定取消关注该指标吗？',
                yes: function() {
                    self.model.destroy();
                }
            });
        },

        _showModal: function(e) {
            e.preventDefault();
            e.stopPropagation();
            $(e.currentTarget).parent("td").removeClass("reminder");
            new IndicatorModal({
                indicData: {
                    id: this.model.get('indicId'),
                    name: this.model.get('indicName')
                }
            });
        }
    });

});