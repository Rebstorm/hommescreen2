var FileUtil = function(){
    
    function checkAppSettings(file, callback){
        
        var fName = getFile(file);
        
        var res = new Promise(function(resolve, rej){
        
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fs){
                fs.root.getFile(fName, { create: true, exclusive: false }, function(fileEntry){
            
                    // Not sure if necessary.
                    if(fileEntry.isFile){
                        try{
                             fileEntry.file(function (file) {
                                var reader = new FileReader();
                                reader.onloadend = function() {
                                   var p = {}
                                   if(this.result == "" || this.result.size < 1){
                                      p.readValue = ReadValues.EMPTY;
                                      p.fEntry = fileEntry;
                                      resolve(p);// the file is empty - we need a first time set up
                                   } else {
                                      p.readValue = this.result;
                                      p.fEntry = fileEntry;
                                      resolve(p); // everything is OK. Time to read the whole thing.
                                   }
                                };

                                reader.readAsText(file);
                            }, onErrorReadFile);


                        } catch(e){
                            onErrorReadFile(e);
                        }
                    } 
                });
            }, onErrorLoadFs);

        }


        );

        res.then(function(r){
            callback(r);
        });
    }

    function getFile(file){
        var res = "";
        switch(file){
            case Files.Apps:
                res = "apps.json";
                break;
            case Files.Settings:
                res = "settings.json";
                break;
            case Files.Weather:
                res = "weather.json";
                break;

            case Files.HueApp:
                res = "hue.json";
                break;

            default:
                console.log("couldnt find enum of file");
                break;

        }

        return res;
    }


    function writeFile(fileEntry, dataObj) {
        // Create a FileWriter object for our FileEntry (log.txt).
        fileEntry.createWriter(function (fileWriter) {
            fileWriter.onwriteend = function() {
                console.log("Successfully wrote to file.");
                //readFile(fileEntry);
            };

            fileWriter.onerror = function (e) {
                console.log("Failed file write: " + e.toString());
            };

            // If data object is not passed in,
            // create a new Blob instead.
            if (!dataObj) {
                dataObj = new Blob(['some file data'], { type: 'text/plain' });
            }
            fileWriter.seek(0);
            fileWriter.write(dataObj);
        });
    }

    function readFile(fileEntry, callback) {

        fileEntry.file(function (file) {
            var reader = new FileReader();

            reader.onloadend = function() {
                callback(this.result);
                //console.log(fileEntry.fullPath + ": " + this.result);
            };

            reader.readAsText(file);

        }, onErrorReadFile);
    }

    function onErrorReadFile(e){
        console.log(e);
    }
    
    function onErrorLoadFs(e){
        console.log(e);
    }

    function onErrorCreateFile(e){
        console.log(e);
    }

    return {
        checkAppSettings : checkAppSettings,
        readFile: readFile,
        writeFile: writeFile,
    }
}();

var ReadValues = {
    EMPTY: 0,
    OK: 1,
    ERROR: 2,
};

var Files = {
    Apps : 0,
    Settings: 1,
    Weather: 2,
    HueApp: 3
        
}