var http = require('http')
var fs = require('fs')
var server =new http.Server()
var phantomInstance = require('./phantomTest').instanceOf1688

async function  get1688SearchUrl(res,imagePath){
    function deletePicAndResp(pathToImage,url,res){
        console.log("called back!")
        fs.unlink(pathToImage,err=>{
            if(err)
                console.log(err)
            else
                console.log(pathToImage+" has been deleted!")
        })
        res.writeHead(200,{'Content-Type':'application/json'})
        res.write('{"succes":true,"data":"'+url+'"}')
        res.end()
    }
    await  phantomInstance(deletePicAndResp,res,imagePath);
}


server.on('request',(req,res)=>{
    if(req.url=="/ajax/fileReader") {
        var data = ""
        req.on("data",reqData=>{
            data+=reqData
        })
        req.on("end",()=>{
            data = JSON.parse(data)
            var imgData = data.data
            var fileName = "temp/"+data.fileName
            var base64Data = imgData.replace(/^data:image\/\D+base64,/, "")
            var dataBuffer = new Buffer(base64Data, 'base64')
            fs.writeFileSync(fileName, dataBuffer, function(err) {
                if(err){
                    res.send(err)
                }else{
                    res.send("保存成功！")
                }
            })
            get1688SearchUrl(res,fileName)
        })
    }else{
        res.writeHead(200,{'Content-Type':'application/json'})
        res.write('{"succes":false}')
        res.end()
    }
})



server.listen(3000)