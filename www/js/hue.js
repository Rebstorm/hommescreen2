var HueApp = function(){
    
    var user;

    function init(){
        createConstantInterface();
        AppInit.startNewActivity();

        createHueConnection();
    }
   

    function createInterface(lights){
        var mainPopup = document.getElementById("main-popup");
        var mainContainer = document.createElement("div");
        
        var hueAppContainer = document.createElement("div");

        var lightBars = document.createElement("div");

        mainContainer.id = "main-app-content";
        
        hueAppContainer.id = "hue-app-c";
        hueAppContainer.className = "full-app-c";

        lightBars.id = "hue-app-lightbars";
        lightBars.className = "hue-light-bar";
        
        for(light in lights){
            var x = createNewLightBar(lights[light], light);
            lightBars.appendChild(x);
        }

        hueAppContainer.appendChild(lightBars);
        mainContainer.appendChild(hueAppContainer);
        mainPopup.appendChild(mainContainer);

 
    }

    function createConstantInterface(){
        
        if(document.getElementById("spectrum-canvas") == undefined){
            var hueColorPopup = document.getElementById("hue-color-popup");
            
            var spectrumCanvas = document.createElement("canvas");
            spectrumCanvas.className = "hue-spectrum-canvas";
            spectrumCanvas.id = "spectrum-canvas";

            hueColorPopup.appendChild(spectrumCanvas);

            var spectrumCanvas = document.getElementById("spectrum-canvas");
            var spectrumContext = spectrumCanvas.getContext("2d");

            var spectrumImg = new Image();
            spectrumImg.src = "resources/system/spectrum.jpg";
            spectrumImg.onload = function(){
                spectrumContext.drawImage(spectrumImg, 0, 0 );
            }
            
            // constans that shouldnt be regenerated.
            spectrumCanvas.addEventListener("touchmove", function(e){
                if(e instanceof TouchEvent){
                    var pos = spectrumCanvas.getBoundingClientRect();

                    var x = e.changedTouches[0].clientX - pos.left;
                    var y = e.changedTouches[0].clientY - pos.top;

                    console.log("x: "+ x + "y: " + y);                
                }
            });

            document.getElementById("hue-popup-exit").addEventListener("click", function(){
                closeColorWindow();
            });
            
        }

    }

    function createHueConnection(){

        var hue = jsHue();
        FileUtil.checkAppSettings(Files.HueApp, function(fEntry){
            FileUtil.readFile(fEntry.fEntry, function(r){
                r = JSON.parse(r);
                // discovery
                hue.discover(
                    function(bridges) {
                        if(bridges.length === 0) {
                            console.log('No bridges found. :(');
                        }
                        else {
                            bridges.forEach(function(e) {
                                if(r.username){ 
                                   var bridge = hue.bridge(e.internalipaddress);
                                   user = bridge.user(r.username);
                                   user.getLights(function(l){
                                      createInterface(l);
                                   });
                                   
                               } else {
                                   pairBridgeFirstTime(e.internalipaddress);
                                }


                            });
                        }
                    },
                    function(error) {
                        console.error(error.message);
                    }
                );
            });
        });

      
        
    }

    function pairBridgeFirstTime(ip){
        var hue = jsHue();
        var bridge = hue.bridge(ip);

        bridge.createUser('homescreen2', function(data) {
            // extract bridge-generated username from returned data
            if(("error" in data[0]) && (data[0].error.description.indexOf("link") >= 0)){
                window.setTimeout(function(){
                    connectToBridge(ip);
                }, 1000);
                return;
            } else if("success" in data[0]) {
                var username = data[0].success.username;
                var r = {"username": username};

                // instantiate user object with username
                user = bridge.user(username);
                
                FileUtil.checkAppSettings(Files.HueApp, function(fileEntry){
                    FileUtil.writeFile(fileEntry.fEntry, JSON.stringify(r));
                });
                user.getLights(function(l){
                  createInterface(l);
                });
            }
        });
         
    }
    
    var nextId = 0;
    function createNewLightBar(light, nr){

        var lightBarContainer = document.createElement("div");
        lightBarContainer.className = "hue-lightbar-container";
        lightBarContainer.id = "lightbar" + nextId;
        lightBarContainer.dataset.light = JSON.stringify(light);
        lightBarContainer.dataset.nr = nr;
        
        var lightBar = document.createElement("div");
        lightBar.id = "lightbarC"+nextId;
        lightBar.className = "hue-lightbar-c";

        var lightIndicator = document.createElement("div");
        lightIndicator.id = "lightindicator" + nextId;
        lightIndicator.className = "hue-light-indicator glowing";
        var color = xyBriToRgb(light.state.xy[0], light.state.xy[1], light.state.bri);
        if(light.state.on)
            lightIndicator.style.background = "rgb("+parseInt(color.r)+","+parseInt(color.g)+","+parseInt(color.b)+")";

        lightIndicator.addEventListener("click", function(e){
           toggleColorWindow(); 
        });

        var textContainer = document.createElement("div");
        textContainer.className = "hue-light-text";
        var lightName = document.createElement("p");
        var lightOpacity = document.createElement("p");
        lightName.textContent = light.name;
        lightName.className ="hue-text";
        lightOpacity.textContent = light.state.bri ;
        lightOpacity.className = "hue-text";
        

        var toggleBar = document.createElement("div");
        toggleBar.className = "hue-toggle-bar";


        toggleBar.addEventListener("click", function(e){
           var id = document.getElementById(this.dataset.button);
           var lightId = document.getElementById("lightbar" + this.dataset.nr).dataset.nr;
           if(id.className == "hue-toggle-bar-button"){
                id.className = "hue-toggle-bar-button-toggled";
                user.setLightState(parseInt(lightId), {on: false}, function(d){
                    console.log(d);
                })
           } else {
                id.className = "hue-toggle-bar-button";
                user.setLightState(parseInt(lightId), {on: true}, function(d){
                    console.log(d);
                })
           }
        });

        var toggleBarButton = document.createElement("div");
        toggleBarButton.id = "hue-toggle-button"+nextId;
        toggleBarButton.className = "hue-toggle-bar-button";

        toggleBar.dataset.button = toggleBarButton.id;
        toggleBar.dataset.nr = nextId;

        toggleBar.appendChild(toggleBarButton);

        textContainer.appendChild(lightName);
        textContainer.appendChild(lightOpacity);
        
        lightBar.appendChild(textContainer);
        lightBar.appendChild(toggleBar);
        
        lightBarContainer.appendChild(lightBar);
        lightBarContainer.appendChild(lightIndicator);

        nextId++;

        return lightBarContainer;

    }
    function toggleColorWindow(){
        var x = document.getElementById("hue-color-popup");

        if(x.style.display == "none"){
            x.style.display = "block";
        } else {
            x.style.display = "none";
        }

    }

    function closeColorWindow(){
        document.getElementById("hue-color-popup").style.display = "none";
    }


   function xyBriToRgb(x, y, bri){
        z = 1.0 - x - y;
        Y = bri / 255.0; // Brightness of lamp
        X = (Y / y) * x;
        Z = (Y / y) * z;
        r = X * 1.612 - Y * 0.203 - Z * 0.302;
        g = -X * 0.509 + Y * 1.412 + Z * 0.066;
        b = X * 0.026 - Y * 0.072 + Z * 0.962;
        r = r <= 0.0031308 ? 12.92 * r : (1.0 + 0.055) * Math.pow(r, (1.0 / 2.4)) - 0.055;
        g = g <= 0.0031308 ? 12.92 * g : (1.0 + 0.055) * Math.pow(g, (1.0 / 2.4)) - 0.055;
        b = b <= 0.0031308 ? 12.92 * b : (1.0 + 0.055) * Math.pow(b, (1.0 / 2.4)) - 0.055;
        maxValue = Math.max(r,g,b);
        r /= maxValue;
        g /= maxValue;
        b /= maxValue;
        r = r * 255;   if (r < 0) { r = 255 };
        g = g * 255;   if (g < 0) { g = 255 };
        b = b * 255;   if (b < 0) { b = 255 };
        return {
            r :r,
            g :g,
            b :b
        }
    }


    return {
        init : init,
    }
}();