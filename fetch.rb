#!/usr/bin/ruby

url = ARGV[0]

filename = %r{/(grd.*?)\.pdf}.match(url)[1]
puts 'wget #{url} -O #{filename}.pdf'
system 'wget #{url} -O #{filename}.pdf'

puts 'pdftotext -layout #{filename}.pdf'
system 'pdftotext -layout #{filename}.pdf'

puts 'rm #{filename}.pdf'
system 'rm #{filename}.pdf'

puts 'addDB/addDB #{filename}.txt classes.db'
system 'addDB/addDB #{filename}.txt classes.db'

puts 'mv #{filename}.txt gradeFiles'
system 'mv #{filename}.txt gradeFiles'
