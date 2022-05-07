// This object represent the postprocessor
Postprocessor = {
    // The postprocess function takes the audio samples data and the post-processing effect name
    // and the post-processing stage as function parameters. It gathers the required post-processing
    // paramters from the <input> elements, and then applies the post-processing effect to the
    // audio samples data of every channels.
    postprocess: function(channels, effect, pass) {
        switch(effect) {
            case "no-pp":
                // Do nothing
                break;

            case "reverse":
                /**
                * TODO: Complete this function
                **/

                // Post-process every channels
                for(var c = 0; c < channels.length; ++c) {
                    // Get the sample data of the channel
                    
                    var audioSequence = channels[c].audioSequenceReference;

                    // Apply the post-processing, i.e. reverse
                    audioSequence.data.reverse();

                    // Update the sample data with the post-processed data
                    channels[c].setAudioSequence(audioSequence);
                }
                break;

            case "boost":
                // Find the maximum gain of all channels
                var maxGain = -1.0;
                for(var c = 0; c < channels.length; ++c) {
                    // Get the sample data of the channel
                    var audioSequence = channels[c].audioSequenceReference;
                    var gain = audioSequence.getGain();
                    if(gain > maxGain) {
                        maxGain = gain;
                    }
                }

                // Determin the boost multiplier
                var multiplier = 1.0 / maxGain;

                // Post-process every channels
                for(var c = 0; c < channels.length; ++c) {
                    // Get the sample data of the channel
                    var audioSequence = channels[c].audioSequenceReference;

                    // For every sample, apply a boost multiplier
                    for(var i = 0; i < audioSequence.data.length; ++i) {
                        audioSequence.data[i] *= multiplier;
                    }

                    // Update the sample data with the post-processed data
                    channels[c].setAudioSequence(audioSequence);
                }
                break;

            case "adsr":
                /**
                * TODO: Complete this function
                **/

                // Obtain all the required parameters
                var attackDuration = parseFloat($("#adsr-attack-duration").data("p" + pass)) * sampleRate;
                var decayDuration = parseFloat($("#adsr-decay-duration").data("p" + pass)) * sampleRate;
                var releaseDuration = parseFloat($("#adsr-release-duration").data("p" + pass)) * sampleRate;
                var sustainLevel = parseFloat($("#adsr-sustain-level").data("p" + pass)) / 100.0;
                var sustainDuration = 6 * sampleRate - (attackDuration + decayDuration + releaseDuration);

                for(var c = 0; c < channels.length; ++c) {
                    // Get the sample data of the channel
                    var audioSequence = channels[c].audioSequenceReference;
                    

                    for(var i = 0; i < audioSequence.data.length; ++i) {

                        // TODO: Complete the ADSR postprocessor
                        // Hinst: You can use the function lerp() in utility.js
                        // for performing linear interpolation
                        //audioSequence.data[i] *= multiplier;

                        if (i <= attackDuration) {
                            audioSequence.data[i] *= lerp(0, 1, i / attackDuration);
                        }
                        else if (i <= attackDuration + decayDuration) {
                            audioSequence.data[i] *= lerp(1, sustainLevel, (i - attackDuration) / decayDuration);
                        }
                        else if (i <= attackDuration + decayDuration+ sustainDuration) {
                            audioSequence.data[i] *= sustainLevel;
                        }
                        else {
                            audioSequence.data[i] *= lerp(sustainLevel, 0, (i - (attackDuration + decayDuration + sustainDuration)) / releaseDuration);
                        }
                        
                    }

                    // Update the sample data with the post-processed data
                    channels[c].setAudioSequence(audioSequence);
                }
                break;

            case "tremolo":
                /**
                * TODO: Complete this function
                **/

                // Obtain all the required parameters
                var tremoloFrequency = parseFloat($("#tremolo-frequency").data("p" + pass));
                var wetness = parseFloat($("#tremolo-wetness").data("p" + pass));

                // Post-process every channels
                for(var c = 0; c < channels.length; ++c) {

                    // Get the sample data of the channel
                    var audioSequence = channels[c].audioSequenceReference;

                    // For every sample, apply a tremolo multiplier
                    for (var i = 0; i < audioSequence.data.length; ++i) {

                        var currentTime = i / sampleRate;
                        var multiplier = (Math.sin(2.0 * Math.PI * tremoloFrequency * currentTime + 1.5 * Math.PI) + 1) / 2;
                        multiplier = multiplier * wetness + (1 - wetness);
                        audioSequence.data[i] *= multiplier;
                 

                    }

                    // Update the sample data with the post-processed data
                    channels[c].setAudioSequence(audioSequence);
                }
                break;

            case "echo":
                /**
                * TODO: Complete this function
                **/

                // Obtain all the required parameters
                var delayLineDuration = parseFloat($("#echo-delay-line-duration").data("p" + pass));
                var multiplier = parseFloat($("#echo-multiplier").data("p" + pass));

                var delayLineSize = parseInt(delayLineDuration * sampleRate);

                // Post-process every channels
                for(var c = 0; c < channels.length; ++c) {
                    // Get the sample data of the channel
                    var audioSequence = channels[c].audioSequenceReference;

                    // Create a new empty delay line
                    var delayLine = [];
                    for (var i = 0; i < delayLineSize; i++)
                        delayLine.push(0);

                    var delayLineOutput;

                    // Get the sample data of the channel
                    for(var i = 0; i < audioSequence.data.length; ++i) {
                        // Get the echoed sample from the delay line

                        // Add the echoed sample to the current sample, with a multiplier

                        // Put the current sample into the delay line
                        delayLineOutput = delayLine[i % delayLineSize];

                        audioSequence.data[i] = audioSequence.data[i] + delayLineOutput * multiplier;

                        delayLine[i % delayLineSize] = audioSequence.data[i];
                            
                    }

                    // Update the sample data with the post-processed data
                    channels[c].setAudioSequence(audioSequence);
                }
                break;
            
            case "pitch":
                //pitch scaling
                break;

            case "time":
                var multiplier = parseFloat($("#time-multiplier").data("p" + pass));
                if (multiplier == 1) break;

                const Ls = sampleRate * 0.02;          // cut 15ms for every N samples
                var repeatNum;                          // find N according to multiplier, repeat splice for every N samples

                if (multiplier > 1)
                    repeatNum = Math.floor((Ls * multiplier) / (multiplier - 1));
                else 
                    repeatNum = Math.floor(Ls / (1/multiplier - 1));
                    
                for(var c = 0; c < channels.length; ++c) {
                    var audioSequence = channels[c].audioSequenceReference;
                    const length = audioSequence.data.length

                    for(var i = 0; i < length / repeatNum; ++i) {
                        if (multiplier > 1) {
                            const sequence = audioSequence.data.slice(i * (repeatNum - Ls), i * (repeatNum - Ls) + Ls);

                            // remove the sequence from the audio
                            audioSequence.data.splice(i * (repeatNum - Ls), Ls);

                            // crossfade the beginning of the sequence with audio data right after
                            for (var j = 0; j < sequence.length; ++j) {
                                if (i * (repeatNum - Ls) + j >= audioSequence.data.length)
                                    break;
                                audioSequence.data[i * (repeatNum - Ls) + j] *= (j / sequence.length)
                                audioSequence.data[i * (repeatNum - Ls) + j] += sequence[j] * (1 - j / sequence.length)
                            }

                        }
                        else {
                            const sequence = audioSequence.data.slice(i * (repeatNum + Ls), i * (repeatNum + Ls) + Ls);
                            const afterSequence = audioSequence.data.slice(i * (repeatNum + Ls) + Ls, i * (repeatNum + Ls) + 2 * Ls);

                            // repeat the sequence from the audio
                            audioSequence.data.splice.apply(audioSequence.data, [i * (repeatNum + Ls), 0].concat(sequence))

                            // crossfade the repeated segment with the sequence after
                            for (var j = 0; j < sequence.length; ++j) {
                                if (i * (repeatNum + Ls) + Ls + j >= audioSequence.data.length || j >= afterSequence.length)
                                    break;
                                audioSequence.data[i * (repeatNum + Ls) + Ls + j] *= (j / sequence.length)
                                audioSequence.data[i * (repeatNum + Ls) + Ls + j] += afterSequence[j] * (1 - j / sequence.length)                                
                            }

                        }
                    }

                    channels[c].setAudioSequence(audioSequence);
                }

                break;
            
            default:
                // Do nothing
                break;
        }
        return;
    }
}
