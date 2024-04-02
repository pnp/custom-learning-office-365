module.exports = function () {
    // (
    //     (filepathbase.replace(current.base, ''))
    //     .replace(/-|\//g, '_')
    // ).replace(filename.substr(-3), '')

    let getKeyFromFilename = (item) => {

        var filename = item.path.replace(item.base, '');

        return (
            filename.replace(/\//g, '_')
        ).replace(filename.substr(-3), '');
    }

    return {
        mdGetKey: getKeyFromFilename
    }

}();