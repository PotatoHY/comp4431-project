// This object represent the waveform generator
var WaveformGenerator = {
    // The generateWaveform function takes 4 parameters:
    //     - type, the type of waveform to be generated
    //     - frequency, the frequency of the waveform to be generated
    //     - amp, the maximum amplitude of the waveform to be generated
    //     - duration, the length (in seconds) of the waveform to be generated
    generateWaveform: function (type, frequency, amp, duration) {
        var nyquistFrequency = sampleRate / 2; // Nyquist frequency
        var totalSamples = Math.floor(sampleRate * duration); // Number of samples to generate
        var result = []; // The temporary array for storing the generated samples

        switch (type) {
            case "sine-time": // Sine wave, time domain
                for (var i = 0; i < totalSamples; ++i) {
                    var currentTime = i / sampleRate;
                    result.push(amp * Math.sin(2.0 * Math.PI * frequency * currentTime));
                }
                break;

            case "square-time": // Square wave, time domain
                /**
                * TODO: Complete this generator
                **/
                var oneCycle = sampleRate / frequency;
                var halfCycle = oneCycle / 2;
                for (var i = 0; i < totalSamples; i++) {
                    var whereInTheCycle = i % parseInt(oneCycle);
                    if (whereInTheCycle < halfCycle) {
                        // first half of the cycle
                        result.push(amp * 1);
                    }
                    else {
                        // second half of the cycle
                        result.push(amp * -1);
                    }
                }
                break;

            case "square-additive": // Square wave, additive synthesis
                /**
                * TODO: Complete this generator
                **/
                for (var i = 0; i < totalSamples; i++) {
                    var t = i / sampleRate;
                    var sample = 0;
                    var k = 1;
                    while (k * frequency < Math.min(nyquistFrequency, 500)) {
                        sample += (1.0 / k) * Math.sin(2 * Math.PI * k * frequency * t);
                        k += 2;
                    }
                    result.push(amp * sample * (4/Math.PI));
                }
                break;

            case "sawtooth-time": // Sawtooth wave, time domain
                /**
                * TODO: Complete this generator
                **/
                var oneCycle = sampleRate / frequency;
                for (var i = 0; i < totalSamples; i++) {
                    var whereInTheCycle = i % parseInt(oneCycle);
                    var fractionInTheCycle = whereInTheCycle / oneCycle;
                    result.push(amp * (2 * (1.0 - fractionInTheCycle) - 1));
                }
                break;

            case "sawtooth-additive": // Sawtooth wave, additive synthesis
                /**
                * TODO: Complete this generator
                **/
                for (var i = 0; i < totalSamples; i++) {
                    var t = i / sampleRate;
                    var sample = 0;
                    var k = 1;
                    while (k * frequency < Math.min(nyquistFrequency, 500)) {
                        sample += (1.0 / k) * Math.sin(2 * Math.PI * k * frequency * t);
                        k += 1;
                    }
                    result.push(amp * sample * (2/Math.PI));
                }
                break;

            case "triangle-additive": // Triangle wave, additive synthesis
                /**
                * TODO: Complete this generator
                **/
                var basis = $("#triangle-additive-basis>option:selected").val();

                if (basis == "cosine") {
                    for (var i = 0; i < totalSamples; i++) {
                        var t = i / sampleRate;
                        var sample = 0;
                        var k = 1;
                        while (k * frequency < Math.min(nyquistFrequency, 500)) {
                            sample += (1.0 / (k * k)) * Math.cos(2 * Math.PI * k * frequency * t);
                            k += 2;
                        }
                        result.push(amp * sample * (8 / (Math.PI * Math.PI)));
                    }

                }
                else if (basis == "sine") {
                    for (var i = 0; i < totalSamples; i++) {
                        var t = i / sampleRate;
                        var sample = 0;
                        var k = 1;
                        while (k * frequency < Math.min(nyquistFrequency, 500)) {
                            if ((k % 4) == 1) {
                                sample += (1.0 / (k * k)) * Math.sin(2 * Math.PI * k * frequency * t);
                            }
                            else {
                                sample -= (1.0 / (k * k)) * Math.sin(2 * Math.PI * k * frequency * t);
                            }
                            k += 2;
                        }
                        result.push(amp * sample * (8 / (Math.PI * Math.PI)));
                    }
                }

                break;

            case "customized-additive-synthesis": // Customized additive synthesis
                /**
                * TODO: Complete this generator
                **/
                var max = 0;
                var min = 0;
                var absMax = 1;
                var multiplier = 1;

                // Obtain all the required parameters
                var harmonics = [];
                for (var h = 1; h <= 10; ++h) {
                    harmonics.push($("#additive-f" + h).val());
                }

                for (var i = 0; i < totalSamples; i++) {
                    var t = i / sampleRate;
                    var sample = 0;
                    var k = 1;
                    while (k < 10 && k * frequency < nyquistFrequency) {
                        sample += harmonics[k - 1] * Math.sin(2 * Math.PI * k * frequency * t);
                        k += 1;

                        if (sample > max) {
                            max = sample;
                        }
                        else if (sample < min) {
                            min = sample;
                        }
                    }

                }

                if (Math.abs(max) > Math.abs(min)) {
                    absMax = max;
                }
                else {
                    absMax = min;
                }

                multiplier = 1.0 / absMax;
                //multiplier = 1;

                for (var i = 0; i < totalSamples; i++) {
                    var t = i / sampleRate;
                    var sample = 0;
                    var k = 1;
                    while (k < 10 && k * frequency < nyquistFrequency) {
                        sample += harmonics[k - 1] * Math.sin(2 * Math.PI * k * frequency * t);
                        k += 1;
                    }
                    result.push(amp * sample * multiplier);
                }

                break;

            case "white-noise": // White noise
                /**
                * TODO: Complete this generator
                **/
                for (var i = 0; i < totalSamples; i++) {
                    result.push(amp * (Math.random() * 2 - 1));
                }
                break;

            case "karplus-strong": // Karplus-Strong algorithm
                /**
                * TODO: Complete this generator
                **/

                // Obtain all the required parameters
                var base = $("#karplus-base>option:selected").val();
                var b = parseFloat($("#karplus-b").val());
                //var delay = parseInt($("#karplus-p").val());
                var oneCycle = sampleRate / frequency;

                var findP = $("#karplus-use-freq").prop("checked");

                if (findP) {
                    var delay = Math.floor(sampleRate / frequency);
                }
                else {
                    var delay = parseInt($("#karplus-p").val());
                }


                for (var i = 0; i < totalSamples; i++) {

                    if (i <= delay) {
                        if (base == 'white-noise') {
                            result.push(amp * (Math.random() * 2 - 1));
                        }
                        else if (base == 'sawtooth') {
                            var whereInTheCycle = i % parseInt(oneCycle);
                            var fractionInTheCycle = whereInTheCycle / oneCycle;
                            result.push(amp * (2 * (1.0 - fractionInTheCycle) - 1));
                        }
                    }
                    else {
                        //result.push(b * 0.5 * (result[i - delay] + result[i - delay - 1]) - (1-b) * 0.5 * (result[i - delay] + result[i - delay - 1]));
                        var r = Math.floor(Math.random() * 100) + 1;
                        if (r <= b * 100) {
                            result.push(0.5 * (result[i - delay] + result[i - delay - 1]));
                        }
                        else{
                            result.push( -0.5 * (result[i - delay] + result[i - delay - 1]));
                        }
                        
                    }
                    
                }

                break;

            case "fm": // FM
                /**
                * TODO: Complete this generator
                **/

                // Obtain all the required parameters
                var carrierFrequency = parseFloat($("#fm-carrier-frequency").val());
                var carrierAmplitude = parseFloat($("#fm-carrier-amplitude").val());
                var modulationFrequency = parseFloat($("#fm-modulation-frequency").val());
                var modulationAmplitude = parseFloat($("#fm-modulation-amplitude").val());
                var useADSR = $("#fm-use-adsr").prop("checked");
                var useFM = $("#fm-use-freq-multiplier").prop("checked");

                if (useADSR) { // Obtain the ADSR parameters
                    var attackDuration = parseFloat($("#fm-adsr-attack-duration").val()) * sampleRate;
                    var decayDuration = parseFloat($("#fm-adsr-decay-duration").val()) * sampleRate;
                    var releaseDuration = parseFloat($("#fm-adsr-release-duration").val()) * sampleRate;
                    var sustainLevel = parseFloat($("#fm-adsr-sustain-level").val()) / 100.0;
                    var sustainDuration = 6 * sampleRate - (attackDuration + decayDuration + releaseDuration);
                }
                if (useFM) {
                    carrierFrequency = carrierFrequency * frequency;
                    modulationFrequency = modulationFrequency * frequency;
                }

                for (var i = 0; i < totalSamples; ++i) {
                    var currentTime = i / sampleRate;

                    var modulationAmplitudeADSR = modulationAmplitude;
                    if (useADSR) {
                        if (i <= attackDuration) {
                            modulationAmplitudeADSR = modulationAmplitude * lerp(0, 1, i / attackDuration);
                        }
                        else if (i <= attackDuration + decayDuration) {
                            modulationAmplitudeADSR = modulationAmplitude * lerp(1, sustainLevel, (i - attackDuration) / decayDuration);
                        }
                        else if (i <= attackDuration + decayDuration + sustainDuration) {
                            modulationAmplitudeADSR = modulationAmplitude * sustainLevel;
                        }
                        else {
                            modulationAmplitudeADSR = modulationAmplitude * lerp(sustainLevel, 0, (i - (attackDuration + decayDuration + sustainDuration)) / releaseDuration);
                        }
                    }

                    var modulator = modulationAmplitudeADSR * Math.sin(2.0 * Math.PI * modulationFrequency * currentTime);
                    result.push(carrierAmplitude * Math.sin(2.0 * Math.PI * carrierFrequency * currentTime + modulator));
                }

                break;

            case "repeating-narrow-pulse": // Repeating narrow pulse
                var cycle = Math.floor(sampleRate / frequency);
                for (var i = 0; i < totalSamples; ++i) {
                    if (i % cycle === 0) {
                        result.push(amp * 1.0);
                    } else if (i % cycle === 1) {
                        result.push(amp * -1.0);
                    } else {
                        result.push(0.0);
                    }
                }
                break;

            default:
                break;
        }

        return result;
    }
};
