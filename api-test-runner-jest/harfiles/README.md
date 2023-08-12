
jsonplaceholder.nocache.har.json  - This file is the a har file typicode with the 'disable cache' button selector (so the content is included)

We need to use the disable cache option so that the har file includes the actual content. However, it runs into this issue when we try to use it with Mockbin 
https://github.com/Kong/mockbin/issues/128

jsonplaceholder.typicode.com.har.json - I can't remember what this is - the straight har file without disable cache? 

jsonplaceholder.har.json - this is a modified har file - actually it's the response only. We remove the headers and set headersize to 0.  This works with Mockbin. 