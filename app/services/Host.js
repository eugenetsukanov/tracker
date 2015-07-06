var Host = function (baseUrl) {
    
    this.getUrl = function (_url) {
        return baseUrl + _url;
    }
};

module.exports = Host;