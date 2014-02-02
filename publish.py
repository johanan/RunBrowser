import boto
import os

from boto.s3.key import Key

os.system('grunt')


def upload(file_name, bucket):
    k = Key(bucket)
    k.key = file_name
    k.set_contents_from_filename(file_name)

#the AWS keys are in the env - check Trello for them
conn = boto.connect_s3()

bucket = conn.get_bucket('runbrowser')

files = ['index.html', 'cache.manifest', 'favicon.ico', 'leaflet.css', 'leaflet.js', 'runBrowser.min.js',
         'runBrowser.js', 'runbrowser57.png', 'runbrowser72.png', 'runbrowser114.png', 'zepto.min.js',
         'img/glyphicons-halflings-white.png', 'css/bootstrap.min.css', 'css/bootstrap-responsive.min.css',
         'stamen.js']

[upload(file, bucket) for file in files]

