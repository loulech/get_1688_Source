const phantom = require('phantom');

async function instanceOf1688(callBack,res,pathToImage) {
    var instance = await phantom.create(['--ignore-ssl-errors=yes', '--load-images=no']);
    var page = await instance.createPage()
    var start = function(){
        page.evaluateAsync(function(){ document.getElementById('sm-widget-picbtn').click()})
        page.evaluateJavaScript(`
        function a() {
            var list = document.getElementsByTagName("input")
            for(var i in list){
                var temp = list[i]
                if(temp.type == 'file'){
                    return temp.id
                }
            }
        }`).then(function(id){
                console.log(id)
                page.uploadFile('input[id='+id+']', pathToImage).then(function() {
                    console.log("file uploaded!")
                    setTimeout(function(){
                        instance.exit();
                    },4000)
                });
            })
    }
    page.property('onResourceRequested', function(requestData, request) {
        if ((/(https|http):\/\/.+?\.css/gi).test(requestData['url'])) {
            request.abort();
        }else if((/.*oss-cn-shanghai.*/gi).test(requestData['url'])){
            console.log(JSON.stringify(requestData))
        }

    });

    page.on("onUrlChanged",function(targetUrl) {
        if((/.*imageAddress=cbuimgsearch.*/ig).test(targetUrl)){
            console.log("url has been found:"+targetUrl)
            callBack(pathToImage,targetUrl,res)
        }
    })

    page.property("customHeaders",{
        "User-Agent":"Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36"
    })

    var status = await page.open('https://www.1688.com/');
    start();
}



module.exports.instanceOf1688 = instanceOf1688