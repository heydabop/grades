#!/usr/bin/ruby

sem = ARGV[0]

system("./fetch.rb http://web-as.tamu.edu/GradeReports/PDFReports/#{sem}/grd#{sem}AC.pdf classes.db")
system("./fetch.rb http://web-as.tamu.edu/GradeReports/PDFReports/#{sem}/grd#{sem}AG.pdf classes.db")
system("./fetch.rb http://web-as.tamu.edu/GradeReports/PDFReports/#{sem}/grd#{sem}AR.pdf classes.db")
system("./fetch.rb http://web-as.tamu.edu/GradeReports/PDFReports/#{sem}/grd#{sem}AT.pdf classes.db")
system("./fetch.rb http://web-as.tamu.edu/GradeReports/PDFReports/#{sem}/grd#{sem}BA.pdf classes.db")
system("./fetch.rb http://web-as.tamu.edu/GradeReports/PDFReports/#{sem}/grd#{sem}ED.pdf classes.db")
system("./fetch.rb http://web-as.tamu.edu/GradeReports/PDFReports/#{sem}/grd#{sem}EH.pdf classes.db")
system("./fetch.rb http://web-as.tamu.edu/GradeReports/PDFReports/#{sem}/grd#{sem}EL.pdf classes.db")
system("./fetch.rb http://web-as.tamu.edu/GradeReports/PDFReports/#{sem}/grd#{sem}EN.pdf classes.db")
system("./fetch.rb http://web-as.tamu.edu/GradeReports/PDFReports/#{sem}/grd#{sem}GB.pdf classes.db")
system("./fetch.rb http://web-as.tamu.edu/GradeReports/PDFReports/#{sem}/grd#{sem}GE.pdf classes.db")
system("./fetch.rb http://web-as.tamu.edu/GradeReports/PDFReports/#{sem}/grd#{sem}LA.pdf classes.db")
system("./fetch.rb http://web-as.tamu.edu/GradeReports/PDFReports/#{sem}/grd#{sem}MS.pdf classes.db")
system("./fetch.rb http://web-as.tamu.edu/GradeReports/PDFReports/#{sem}/grd#{sem}MN.pdf classes.db")
system("./fetch.rb http://web-as.tamu.edu/GradeReports/PDFReports/#{sem}/grd#{sem}SC.pdf classes.db")
system("./fetch.rb http://web-as.tamu.edu/GradeReports/PDFReports/#{sem}/grd#{sem}VM.pdf classes.db")
