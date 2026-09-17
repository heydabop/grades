#!/usr/bin/ruby

year = ARGV[0]
sem = ARGV[1]

system("./fetch.rb 'https://web-as.tamu.edu/gradereports/Report?year=#{year}&term=#{sem}&college=AC'")
system("./fetch.rb 'https://web-as.tamu.edu/gradereports/Report?year=#{year}&term=#{sem}&college=AG'")
system("./fetch.rb 'https://web-as.tamu.edu/gradereports/Report?year=#{year}&term=#{sem}&college=AR'")
system("./fetch.rb 'https://web-as.tamu.edu/gradereports/Report?year=#{year}&term=#{sem}&college=AT'")
system("./fetch.rb 'https://web-as.tamu.edu/gradereports/Report?year=#{year}&term=#{sem}&college=BA'")
system("./fetch.rb 'https://web-as.tamu.edu/gradereports/Report?year=#{year}&term=#{sem}&college=ED'")
system("./fetch.rb 'https://web-as.tamu.edu/gradereports/Report?year=#{year}&term=#{sem}&college=EH'")
system("./fetch.rb 'https://web-as.tamu.edu/gradereports/Report?year=#{year}&term=#{sem}&college=EL'")
system("./fetch.rb 'https://web-as.tamu.edu/gradereports/Report?year=#{year}&term=#{sem}&college=EN'")
system("./fetch.rb 'https://web-as.tamu.edu/gradereports/Report?year=#{year}&term=#{sem}&college=GB'")
system("./fetch.rb 'https://web-as.tamu.edu/gradereports/Report?year=#{year}&term=#{sem}&college=GE'")
system("./fetch.rb 'https://web-as.tamu.edu/gradereports/Report?year=#{year}&term=#{sem}&college=LA'")
system("./fetch.rb 'https://web-as.tamu.edu/gradereports/Report?year=#{year}&term=#{sem}&college=MS'")
system("./fetch.rb 'https://web-as.tamu.edu/gradereports/Report?year=#{year}&term=#{sem}&college=MN'")
system("./fetch.rb 'https://web-as.tamu.edu/gradereports/Report?year=#{year}&term=#{sem}&college=SC'")
system("./fetch.rb 'https://web-as.tamu.edu/gradereports/Report?year=#{year}&term=#{sem}&college=VM'")
