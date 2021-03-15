# EDX PRONUNCIATION LABS

## WHAT IS THIS?

This repo contains all that you need to implement pronunciation labs in your edx/openedx courses, without further installation of anything server based and easy to configure.

![component](https://i.imgur.com/jKfrSSb.png)

## HOW TO CONFIGURE

In order to use this labs you will need to upload as resource to your course the files that are included in the *static* folder:

· audioRecorder.js
· recording.png
· stop.png
· your audio file in mp3 format (you can use olle-carmen-quien-es-ese-chico.mp3 as example)

Once those files are uploaded you need to add an html component and select Raw HTML

![html](https://i.imgur.com/PPBBdjq.png)

![raw](https://i.imgur.com/zCjRmmo.png)

then you edit the component and paste inside the content of the template.html you can configure the audio that will be played and the mensages that the user will see changing the variables at the comment section on the header

````html 
 <comment audiosrc="/static/olle-carmen-quien-es-ese-chico.mp3" 
    msginstruct="Pronunciation exercise" 
    msgunsupported="This navigator cannot play this type of exercise." 
    msgtoollink="(Click here for instructions)" 
    msgtooltip="&lt;p&gt;1. Press the Play button on the left hand side and listen to the model recording&lt;/p&gt;&lt;p&gt;2. Press the Record button to record yourself&lt;/p&gt;&lt;p&gt;2b. Press the square button to stop recording&lt;/p&gt;&lt;p&gt;3. Press the Play button on the right hand side to listen to yourself&lt;/p&gt;" 
    imgrec="/static/recording.png" 
    imgstop="/static/stop.png"> 
  </comment>
````

![edition](https://i.imgur.com/3NrpRa3.png)

you should change the audiosrc for each exercise the rest is there in case you need to configure it for other languages or other courses.

Save and enjoy 
