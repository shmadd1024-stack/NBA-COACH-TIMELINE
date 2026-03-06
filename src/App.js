import { useState, useRef, useEffect } from "react";

const RAW_DATA = [{"franchise": "Atlanta Hawks", "coach": "R. Potter", "start": 1949, "end": 1950, "wins": 1, "losses": 4}, {"franchise": "Atlanta Hawks", "coach": "D. McMillan", "start": 1950, "end": 1951, "wins": 9, "losses": 14}, {"franchise": "Atlanta Hawks", "coach": "D. Moore", "start": 1951, "end": 1952, "wins": 17, "losses": 49}, {"franchise": "Atlanta Hawks", "coach": "A. Levane", "start": 1952, "end": 1954, "wins": 38, "losses": 79}, {"franchise": "Atlanta Hawks", "coach": "R. Holzman", "start": 1954, "end": 1957, "wins": 73, "losses": 104}, {"franchise": "Atlanta Hawks", "coach": "A. Hannum", "start": 1957, "end": 1958, "wins": 41, "losses": 31}, {"franchise": "Atlanta Hawks", "coach": "A. Phillip", "start": 1958, "end": 1959, "wins": 6, "losses": 4}, {"franchise": "Atlanta Hawks", "coach": "E. Macauley", "start": 1959, "end": 1960, "wins": 46, "losses": 29}, {"franchise": "Atlanta Hawks", "coach": "P. Seymour", "start": 1960, "end": 1962, "wins": 56, "losses": 37}, {"franchise": "Atlanta Hawks", "coach": "H. Gallatin", "start": 1962, "end": 1965, "wins": 111, "losses": 82}, {"franchise": "Atlanta Hawks", "coach": "R. Guerin", "start": 1965, "end": 1972, "wins": 299, "losses": 272}, {"franchise": "Atlanta Hawks", "coach": "C. Fitzsimmons", "start": 1972, "end": 1976, "wins": 140, "losses": 180}, {"franchise": "Atlanta Hawks", "coach": "H. Brown", "start": 1976, "end": 1981, "wins": 199, "losses": 208}, {"franchise": "Atlanta Hawks", "coach": "K. Loughery", "start": 1981, "end": 1983, "wins": 85, "losses": 79}, {"franchise": "Atlanta Hawks", "coach": "M. Fratello", "start": 1983, "end": 1990, "wins": 324, "losses": 250}, {"franchise": "Atlanta Hawks", "coach": "B. Weiss", "start": 1990, "end": 1993, "wins": 124, "losses": 122}, {"franchise": "Atlanta Hawks", "coach": "L. Wilkens", "start": 1993, "end": 2000, "wins": 310, "losses": 232}, {"franchise": "Atlanta Hawks", "coach": "L. Kruger", "start": 2000, "end": 2003, "wins": 69, "losses": 122}, {"franchise": "Atlanta Hawks", "coach": "T. Stotts", "start": 2003, "end": 2004, "wins": 28, "losses": 54}, {"franchise": "Atlanta Hawks", "coach": "M. Woodson", "start": 2004, "end": 2010, "wins": 206, "losses": 286}, {"franchise": "Atlanta Hawks", "coach": "L. Drew", "start": 2010, "end": 2013, "wins": 128, "losses": 102}, {"franchise": "Atlanta Hawks", "coach": "M. Budenholzer", "start": 2013, "end": 2018, "wins": 213, "losses": 197}, {"franchise": "Atlanta Hawks", "coach": "L. Pierce", "start": 2018, "end": 2021, "wins": 63, "losses": 120}, {"franchise": "Atlanta Hawks", "coach": "N. McMillan", "start": 2021, "end": 2023, "wins": 72, "losses": 69}, {"franchise": "Atlanta Hawks", "coach": "Q. Snyder", "start": 2023, "end": 2026, "wins": 103, "losses": 119}, {"franchise": "Boston Celtics", "coach": "J. Russell", "start": 1946, "end": 1948, "wins": 42, "losses": 66}, {"franchise": "Boston Celtics", "coach": "A. Julian", "start": 1948, "end": 1950, "wins": 47, "losses": 81}, {"franchise": "Boston Celtics", "coach": "R. Auerbach", "start": 1950, "end": 1966, "wins": 795, "losses": 397}, {"franchise": "Boston Celtics", "coach": "B. Russell", "start": 1966, "end": 1969, "wins": 162, "losses": 83}, {"franchise": "Boston Celtics", "coach": "T. Heinsohn", "start": 1969, "end": 1978, "wins": 427, "losses": 263}, {"franchise": "Boston Celtics", "coach": "T. Sanders", "start": 1978, "end": 1979, "wins": 2, "losses": 12}, {"franchise": "Boston Celtics", "coach": "B. Fitch", "start": 1979, "end": 1983, "wins": 242, "losses": 86}, {"franchise": "Boston Celtics", "coach": "K. Jones", "start": 1983, "end": 1988, "wins": 308, "losses": 102}, {"franchise": "Boston Celtics", "coach": "J. Rodgers", "start": 1988, "end": 1990, "wins": 94, "losses": 70}, {"franchise": "Boston Celtics", "coach": "C. Ford", "start": 1990, "end": 1995, "wins": 222, "losses": 188}, {"franchise": "Boston Celtics", "coach": "M. Carr", "start": 1995, "end": 1997, "wins": 48, "losses": 116}, {"franchise": "Boston Celtics", "coach": "R. Pitino", "start": 1997, "end": 2001, "wins": 102, "losses": 146}, {"franchise": "Boston Celtics", "coach": "J. O'Brien", "start": 2001, "end": 2004, "wins": 115, "losses": 95}, {"franchise": "Boston Celtics", "coach": "D. Rivers", "start": 2004, "end": 2013, "wins": 416, "losses": 305}, {"franchise": "Boston Celtics", "coach": "B. Stevens", "start": 2013, "end": 2021, "wins": 354, "losses": 282}, {"franchise": "Boston Celtics", "coach": "I. Udoka", "start": 2021, "end": 2022, "wins": 51, "losses": 31}, {"franchise": "Boston Celtics", "coach": "J. Mazzulla", "start": 2022, "end": 2026, "wins": 218, "losses": 83}, {"franchise": "Brooklyn Nets", "coach": "M. Zaslofsky", "start": 1967, "end": 1969, "wins": 53, "losses": 103}, {"franchise": "Brooklyn Nets", "coach": "Y. Larese", "start": 1969, "end": 1970, "wins": 39, "losses": 45}, {"franchise": "Brooklyn Nets", "coach": "L. Carnesecca", "start": 1970, "end": 1973, "wins": 114, "losses": 138}, {"franchise": "Brooklyn Nets", "coach": "K. Loughery", "start": 1973, "end": 1981, "wins": 297, "losses": 318}, {"franchise": "Brooklyn Nets", "coach": "L. Brown", "start": 1981, "end": 1983, "wins": 91, "losses": 67}, {"franchise": "Brooklyn Nets", "coach": "S. Albeck", "start": 1983, "end": 1985, "wins": 87, "losses": 77}, {"franchise": "Brooklyn Nets", "coach": "D. Wohl", "start": 1985, "end": 1988, "wins": 65, "losses": 114}, {"franchise": "Brooklyn Nets", "coach": "W. Reed", "start": 1988, "end": 1989, "wins": 26, "losses": 56}, {"franchise": "Brooklyn Nets", "coach": "B. Fitch", "start": 1989, "end": 1992, "wins": 83, "losses": 163}, {"franchise": "Brooklyn Nets", "coach": "C. Daly", "start": 1992, "end": 1994, "wins": 88, "losses": 76}, {"franchise": "Brooklyn Nets", "coach": "B. Beard", "start": 1994, "end": 1996, "wins": 60, "losses": 104}, {"franchise": "Brooklyn Nets", "coach": "J. Calipari", "start": 1996, "end": 1999, "wins": 72, "losses": 112}, {"franchise": "Brooklyn Nets", "coach": "D. Casey", "start": 1999, "end": 2000, "wins": 31, "losses": 51}, {"franchise": "Brooklyn Nets", "coach": "B. Scott", "start": 2000, "end": 2004, "wins": 149, "losses": 139}, {"franchise": "Brooklyn Nets", "coach": "L. Frank", "start": 2004, "end": 2010, "wins": 200, "losses": 226}, {"franchise": "Brooklyn Nets", "coach": "A. Johnson", "start": 2010, "end": 2013, "wins": 60, "losses": 116}, {"franchise": "Brooklyn Nets", "coach": "J. Kidd", "start": 2013, "end": 2014, "wins": 44, "losses": 38}, {"franchise": "Brooklyn Nets", "coach": "L. Hollins", "start": 2014, "end": 2016, "wins": 48, "losses": 71}, {"franchise": "Brooklyn Nets", "coach": "K. Atkinson", "start": 2016, "end": 2020, "wins": 118, "losses": 190}, {"franchise": "Brooklyn Nets", "coach": "S. Nash", "start": 2020, "end": 2023, "wins": 94, "losses": 67}, {"franchise": "Brooklyn Nets", "coach": "J. Vaughn", "start": 2023, "end": 2024, "wins": 21, "losses": 33}, {"franchise": "Charlotte Hornets", "coach": "D. Harter", "start": 1988, "end": 1990, "wins": 28, "losses": 94}, {"franchise": "Charlotte Hornets", "coach": "G. Littles", "start": 1990, "end": 1991, "wins": 26, "losses": 56}, {"franchise": "Charlotte Hornets", "coach": "A. Bristow", "start": 1991, "end": 1996, "wins": 207, "losses": 203}, {"franchise": "Charlotte Hornets", "coach": "D. Cowens", "start": 1996, "end": 1999, "wins": 109, "losses": 70}, {"franchise": "Charlotte Hornets", "coach": "P. Silas", "start": 1999, "end": 2004, "wins": 139, "losses": 107}, {"franchise": "Charlotte Hornets", "coach": "B. Bickerstaff", "start": 2004, "end": 2007, "wins": 77, "losses": 169}, {"franchise": "Charlotte Hornets", "coach": "S. Vincent", "start": 2007, "end": 2008, "wins": 32, "losses": 50}, {"franchise": "Charlotte Hornets", "coach": "L. Brown", "start": 2008, "end": 2011, "wins": 88, "losses": 104}, {"franchise": "Charlotte Hornets", "coach": "P. Silas", "start": 2011, "end": 2012, "wins": 7, "losses": 59}, {"franchise": "Charlotte Hornets", "coach": "M. Dunlap", "start": 2012, "end": 2013, "wins": 21, "losses": 61}, {"franchise": "Charlotte Hornets", "coach": "S. Clifford", "start": 2013, "end": 2018, "wins": 196, "losses": 214}, {"franchise": "Charlotte Hornets", "coach": "J. Borrego", "start": 2018, "end": 2022, "wins": 138, "losses": 163}, {"franchise": "Charlotte Hornets", "coach": "S. Clifford", "start": 2022, "end": 2024, "wins": 48, "losses": 116}, {"franchise": "Charlotte Hornets", "coach": "C. Lee", "start": 2024, "end": 2026, "wins": 45, "losses": 94}, {"franchise": "Chicago Bulls", "coach": "R. Kerr", "start": 1966, "end": 1968, "wins": 62, "losses": 101}, {"franchise": "Chicago Bulls", "coach": "D. Motta", "start": 1968, "end": 1976, "wins": 356, "losses": 300}, {"franchise": "Chicago Bulls", "coach": "E. Badger", "start": 1976, "end": 1978, "wins": 84, "losses": 80}, {"franchise": "Chicago Bulls", "coach": "L. Costello", "start": 1978, "end": 1979, "wins": 20, "losses": 36}, {"franchise": "Chicago Bulls", "coach": "J. Sloan", "start": 1979, "end": 1982, "wins": 94, "losses": 121}, {"franchise": "Chicago Bulls", "coach": "P. Westhead", "start": 1982, "end": 1983, "wins": 28, "losses": 54}, {"franchise": "Chicago Bulls", "coach": "K. Loughery", "start": 1983, "end": 1985, "wins": 65, "losses": 99}, {"franchise": "Chicago Bulls", "coach": "S. Albeck", "start": 1985, "end": 1986, "wins": 30, "losses": 52}, {"franchise": "Chicago Bulls", "coach": "D. Collins", "start": 1986, "end": 1989, "wins": 137, "losses": 109}, {"franchise": "Chicago Bulls", "coach": "P. Jackson", "start": 1989, "end": 1998, "wins": 545, "losses": 193}, {"franchise": "Chicago Bulls", "coach": "T. Floyd", "start": 1998, "end": 2002, "wins": 49, "losses": 190}, {"franchise": "Chicago Bulls", "coach": "B. Cartwright", "start": 2002, "end": 2004, "wins": 34, "losses": 62}, {"franchise": "Chicago Bulls", "coach": "S. Skiles", "start": 2004, "end": 2008, "wins": 146, "losses": 125}, {"franchise": "Chicago Bulls", "coach": "V. Del Negro", "start": 2008, "end": 2010, "wins": 82, "losses": 82}, {"franchise": "Chicago Bulls", "coach": "T. Thibodeau", "start": 2010, "end": 2015, "wins": 255, "losses": 139}, {"franchise": "Chicago Bulls", "coach": "F. Hoiberg", "start": 2015, "end": 2019, "wins": 115, "losses": 155}, {"franchise": "Chicago Bulls", "coach": "J. Boylen", "start": 2019, "end": 2020, "wins": 22, "losses": 43}, {"franchise": "Chicago Bulls", "coach": "B. Donovan", "start": 2020, "end": 2026, "wins": 219, "losses": 237}, {"franchise": "Cleveland Cavaliers", "coach": "B. Fitch", "start": 1970, "end": 1979, "wins": 304, "losses": 434}, {"franchise": "Cleveland Cavaliers", "coach": "S. Albeck", "start": 1979, "end": 1980, "wins": 37, "losses": 45}, {"franchise": "Cleveland Cavaliers", "coach": "B. Musselman", "start": 1980, "end": 1981, "wins": 25, "losses": 46}, {"franchise": "Cleveland Cavaliers", "coach": "D. Delaney", "start": 1981, "end": 1982, "wins": 4, "losses": 11}, {"franchise": "Cleveland Cavaliers", "coach": "T. Nissalke", "start": 1982, "end": 1984, "wins": 51, "losses": 113}, {"franchise": "Cleveland Cavaliers", "coach": "G. Karl", "start": 1984, "end": 1986, "wins": 61, "losses": 88}, {"franchise": "Cleveland Cavaliers", "coach": "L. Wilkens", "start": 1986, "end": 1993, "wins": 316, "losses": 258}, {"franchise": "Cleveland Cavaliers", "coach": "M. Fratello", "start": 1993, "end": 1999, "wins": 248, "losses": 212}, {"franchise": "Cleveland Cavaliers", "coach": "R. Wittman", "start": 1999, "end": 2001, "wins": 62, "losses": 102}, {"franchise": "Cleveland Cavaliers", "coach": "J. Lucas", "start": 2001, "end": 2003, "wins": 37, "losses": 87}, {"franchise": "Cleveland Cavaliers", "coach": "P. Silas", "start": 2003, "end": 2005, "wins": 69, "losses": 77}, {"franchise": "Cleveland Cavaliers", "coach": "M. Brown", "start": 2005, "end": 2010, "wins": 272, "losses": 138}, {"franchise": "Cleveland Cavaliers", "coach": "B. Scott", "start": 2010, "end": 2013, "wins": 64, "losses": 166}, {"franchise": "Cleveland Cavaliers", "coach": "M. Brown", "start": 2013, "end": 2014, "wins": 33, "losses": 49}, {"franchise": "Cleveland Cavaliers", "coach": "D. Blatt", "start": 2014, "end": 2016, "wins": 83, "losses": 40}, {"franchise": "Cleveland Cavaliers", "coach": "T. Lue", "start": 2016, "end": 2019, "wins": 101, "losses": 69}, {"franchise": "Cleveland Cavaliers", "coach": "J. Beilein", "start": 2019, "end": 2020, "wins": 14, "losses": 40}, {"franchise": "Cleveland Cavaliers", "coach": "J. Bickerstaff", "start": 2020, "end": 2024, "wins": 165, "losses": 153}, {"franchise": "Cleveland Cavaliers", "coach": "K. Atkinson", "start": 2024, "end": 2026, "wins": 100, "losses": 39}, {"franchise": "Dallas Mavericks", "coach": "D. Motta", "start": 1980, "end": 1987, "wins": 267, "losses": 307}, {"franchise": "Dallas Mavericks", "coach": "J. MacLeod", "start": 1987, "end": 1990, "wins": 96, "losses": 79}, {"franchise": "Dallas Mavericks", "coach": "R. Adubato", "start": 1990, "end": 1993, "wins": 52, "losses": 141}, {"franchise": "Dallas Mavericks", "coach": "Q. Buckner", "start": 1993, "end": 1994, "wins": 13, "losses": 69}, {"franchise": "Dallas Mavericks", "coach": "D. Motta", "start": 1994, "end": 1996, "wins": 62, "losses": 102}, {"franchise": "Dallas Mavericks", "coach": "J. Cleamons", "start": 1996, "end": 1998, "wins": 28, "losses": 70}, {"franchise": "Dallas Mavericks", "coach": "D. Nelson", "start": 1998, "end": 2005, "wins": 323, "losses": 201}, {"franchise": "Dallas Mavericks", "coach": "A. Johnson", "start": 2005, "end": 2008, "wins": 178, "losses": 68}, {"franchise": "Dallas Mavericks", "coach": "R. Carlisle", "start": 2008, "end": 2021, "wins": 555, "losses": 478}, {"franchise": "Dallas Mavericks", "coach": "J. Kidd", "start": 2021, "end": 2026, "wins": 198, "losses": 185}, {"franchise": "Denver Nuggets", "coach": "B. Bass", "start": 1967, "end": 1969, "wins": 89, "losses": 67}, {"franchise": "Denver Nuggets", "coach": "J. McLendon", "start": 1969, "end": 1970, "wins": 9, "losses": 19}, {"franchise": "Denver Nuggets", "coach": "J. Belmont", "start": 1970, "end": 1971, "wins": 3, "losses": 10}, {"franchise": "Denver Nuggets", "coach": "A. Hannum", "start": 1971, "end": 1974, "wins": 118, "losses": 134}, {"franchise": "Denver Nuggets", "coach": "L. Brown", "start": 1974, "end": 1979, "wins": 251, "losses": 134}, {"franchise": "Denver Nuggets", "coach": "D. Walsh", "start": 1979, "end": 1981, "wins": 41, "losses": 72}, {"franchise": "Denver Nuggets", "coach": "D. Moe", "start": 1981, "end": 1990, "wins": 406, "losses": 332}, {"franchise": "Denver Nuggets", "coach": "P. Westhead", "start": 1990, "end": 1992, "wins": 44, "losses": 120}, {"franchise": "Denver Nuggets", "coach": "D. Issel", "start": 1992, "end": 1995, "wins": 96, "losses": 102}, {"franchise": "Denver Nuggets", "coach": "B. Bickerstaff", "start": 1995, "end": 1997, "wins": 39, "losses": 56}, {"franchise": "Denver Nuggets", "coach": "B. Hanzlik", "start": 1997, "end": 1998, "wins": 11, "losses": 71}, {"franchise": "Denver Nuggets", "coach": "M. D'Antoni", "start": 1998, "end": 1999, "wins": 14, "losses": 36}, {"franchise": "Denver Nuggets", "coach": "D. Issel", "start": 1999, "end": 2002, "wins": 84, "losses": 106}, {"franchise": "Denver Nuggets", "coach": "J. Bzdelik", "start": 2002, "end": 2005, "wins": 73, "losses": 119}, {"franchise": "Denver Nuggets", "coach": "G. Karl", "start": 2005, "end": 2013, "wins": 391, "losses": 249}, {"franchise": "Denver Nuggets", "coach": "B. Shaw", "start": 2013, "end": 2015, "wins": 56, "losses": 85}, {"franchise": "Denver Nuggets", "coach": "M. Malone", "start": 2015, "end": 2025, "wins": 471, "losses": 327}, {"franchise": "Denver Nuggets", "coach": "D. Adelman", "start": 2025, "end": 2026, "wins": 36, "losses": 21}, {"franchise": "Detroit Pistons", "coach": "C. Bennett", "start": 1948, "end": 1949, "wins": 0, "losses": 6}, {"franchise": "Detroit Pistons", "coach": "M. Mendenhall", "start": 1949, "end": 1951, "wins": 72, "losses": 64}, {"franchise": "Detroit Pistons", "coach": "P. Birch", "start": 1951, "end": 1954, "wins": 105, "losses": 102}, {"franchise": "Detroit Pistons", "coach": "C. Eckman", "start": 1954, "end": 1958, "wins": 123, "losses": 118}, {"franchise": "Detroit Pistons", "coach": "R. Rocha", "start": 1958, "end": 1960, "wins": 41, "losses": 65}, {"franchise": "Detroit Pistons", "coach": "D. McGuire", "start": 1960, "end": 1963, "wins": 105, "losses": 134}, {"franchise": "Detroit Pistons", "coach": "C. Wolf", "start": 1963, "end": 1965, "wins": 25, "losses": 66}, {"franchise": "Detroit Pistons", "coach": "D. DeBusschere", "start": 1965, "end": 1967, "wins": 50, "losses": 103}, {"franchise": "Detroit Pistons", "coach": "D. Butcher", "start": 1967, "end": 1971, "wins": 50, "losses": 54}, {"franchise": "Detroit Pistons", "coach": "T. Dischinger", "start": 1971, "end": 1972, "wins": 0, "losses": 2}, {"franchise": "Detroit Pistons", "coach": "E. Lloyd", "start": 1972, "end": 1973, "wins": 2, "losses": 5}, {"franchise": "Detroit Pistons", "coach": "R. Scott", "start": 1973, "end": 1976, "wins": 109, "losses": 97}, {"franchise": "Detroit Pistons", "coach": "H. Brown", "start": 1976, "end": 1978, "wins": 53, "losses": 53}, {"franchise": "Detroit Pistons", "coach": "D. Vitale", "start": 1978, "end": 1980, "wins": 34, "losses": 60}, {"franchise": "Detroit Pistons", "coach": "S. Robertson", "start": 1980, "end": 1983, "wins": 97, "losses": 149}, {"franchise": "Detroit Pistons", "coach": "C. Daly", "start": 1983, "end": 1992, "wins": 467, "losses": 271}, {"franchise": "Detroit Pistons", "coach": "R. Rothstein", "start": 1992, "end": 1993, "wins": 40, "losses": 42}, {"franchise": "Detroit Pistons", "coach": "D. Chaney", "start": 1993, "end": 1995, "wins": 48, "losses": 116}, {"franchise": "Detroit Pistons", "coach": "D. Collins", "start": 1995, "end": 1998, "wins": 121, "losses": 88}, {"franchise": "Detroit Pistons", "coach": "A. Gentry", "start": 1998, "end": 2000, "wins": 57, "losses": 51}, {"franchise": "Detroit Pistons", "coach": "G. Irvine", "start": 2000, "end": 2001, "wins": 32, "losses": 50}, {"franchise": "Detroit Pistons", "coach": "R. Carlisle", "start": 2001, "end": 2003, "wins": 100, "losses": 64}, {"franchise": "Detroit Pistons", "coach": "L. Brown", "start": 2003, "end": 2005, "wins": 108, "losses": 56}, {"franchise": "Detroit Pistons", "coach": "F. Saunders", "start": 2005, "end": 2008, "wins": 176, "losses": 70}, {"franchise": "Detroit Pistons", "coach": "M. Curry", "start": 2008, "end": 2009, "wins": 39, "losses": 43}, {"franchise": "Detroit Pistons", "coach": "J. Kuester", "start": 2009, "end": 2011, "wins": 57, "losses": 107}, {"franchise": "Detroit Pistons", "coach": "L. Frank", "start": 2011, "end": 2013, "wins": 54, "losses": 94}, {"franchise": "Detroit Pistons", "coach": "M. Cheeks", "start": 2013, "end": 2014, "wins": 21, "losses": 29}, {"franchise": "Detroit Pistons", "coach": "S. Van Gundy", "start": 2014, "end": 2018, "wins": 152, "losses": 176}, {"franchise": "Detroit Pistons", "coach": "D. Casey", "start": 2018, "end": 2023, "wins": 121, "losses": 263}, {"franchise": "Detroit Pistons", "coach": "M. Williams", "start": 2023, "end": 2024, "wins": 14, "losses": 68}, {"franchise": "Detroit Pistons", "coach": "J. Bickerstaff", "start": 2024, "end": 2026, "wins": 85, "losses": 51}, {"franchise": "Golden State Warriors", "coach": "E. Gottlieb", "start": 1946, "end": 1955, "wins": 263, "losses": 318}, {"franchise": "Golden State Warriors", "coach": "G. Senesky", "start": 1955, "end": 1958, "wins": 119, "losses": 97}, {"franchise": "Golden State Warriors", "coach": "A. Cervi", "start": 1958, "end": 1959, "wins": 32, "losses": 40}, {"franchise": "Golden State Warriors", "coach": "N. Johnston", "start": 1959, "end": 1961, "wins": 95, "losses": 59}, {"franchise": "Golden State Warriors", "coach": "F. McGuire", "start": 1961, "end": 1962, "wins": 49, "losses": 31}, {"franchise": "Golden State Warriors", "coach": "B. Feerick", "start": 1962, "end": 1963, "wins": 31, "losses": 49}, {"franchise": "Golden State Warriors", "coach": "A. Hannum", "start": 1963, "end": 1966, "wins": 100, "losses": 140}, {"franchise": "Golden State Warriors", "coach": "B. Sharman", "start": 1966, "end": 1968, "wins": 87, "losses": 76}, {"franchise": "Golden State Warriors", "coach": "G. Lee", "start": 1968, "end": 1970, "wins": 63, "losses": 71}, {"franchise": "Golden State Warriors", "coach": "A. Attles", "start": 1970, "end": 1983, "wins": 549, "losses": 496}, {"franchise": "Golden State Warriors", "coach": "J. Bach", "start": 1983, "end": 1986, "wins": 89, "losses": 157}, {"franchise": "Golden State Warriors", "coach": "G. Karl", "start": 1986, "end": 1988, "wins": 58, "losses": 88}, {"franchise": "Golden State Warriors", "coach": "D. Nelson", "start": 1988, "end": 1995, "wins": 277, "losses": 260}, {"franchise": "Golden State Warriors", "coach": "R. Adelman", "start": 1995, "end": 1997, "wins": 66, "losses": 98}, {"franchise": "Golden State Warriors", "coach": "P. Carlesimo", "start": 1997, "end": 2000, "wins": 46, "losses": 113}, {"franchise": "Golden State Warriors", "coach": "D. Cowens", "start": 2000, "end": 2002, "wins": 25, "losses": 80}, {"franchise": "Golden State Warriors", "coach": "E. Musselman", "start": 2002, "end": 2004, "wins": 75, "losses": 89}, {"franchise": "Golden State Warriors", "coach": "M. Montgomery", "start": 2004, "end": 2006, "wins": 68, "losses": 96}, {"franchise": "Golden State Warriors", "coach": "D. Nelson", "start": 2006, "end": 2010, "wins": 145, "losses": 183}, {"franchise": "Golden State Warriors", "coach": "K. Smart", "start": 2010, "end": 2011, "wins": 36, "losses": 46}, {"franchise": "Golden State Warriors", "coach": "M. Jackson", "start": 2011, "end": 2014, "wins": 121, "losses": 109}, {"franchise": "Golden State Warriors", "coach": "S. Kerr", "start": 2014, "end": 2026, "wins": 596, "losses": 335}, {"franchise": "Houston Rockets", "coach": "J. McMahon", "start": 1967, "end": 1970, "wins": 61, "losses": 129}, {"franchise": "Houston Rockets", "coach": "A. Hannum", "start": 1970, "end": 1971, "wins": 40, "losses": 42}, {"franchise": "Houston Rockets", "coach": "T. Winter", "start": 1971, "end": 1973, "wins": 51, "losses": 78}, {"franchise": "Houston Rockets", "coach": "J. Egan", "start": 1973, "end": 1976, "wins": 113, "losses": 133}, {"franchise": "Houston Rockets", "coach": "T. Nissalke", "start": 1976, "end": 1979, "wins": 124, "losses": 122}, {"franchise": "Houston Rockets", "coach": "D. Harris", "start": 1979, "end": 1983, "wins": 141, "losses": 187}, {"franchise": "Houston Rockets", "coach": "B. Fitch", "start": 1983, "end": 1988, "wins": 216, "losses": 194}, {"franchise": "Houston Rockets", "coach": "D. Chaney", "start": 1988, "end": 1992, "wins": 164, "losses": 134}, {"franchise": "Houston Rockets", "coach": "R. Tomjanovich", "start": 1992, "end": 2003, "wins": 487, "losses": 383}, {"franchise": "Houston Rockets", "coach": "J. Van Gundy", "start": 2003, "end": 2007, "wins": 182, "losses": 146}, {"franchise": "Houston Rockets", "coach": "R. Adelman", "start": 2007, "end": 2011, "wins": 193, "losses": 135}, {"franchise": "Houston Rockets", "coach": "K. McHale", "start": 2011, "end": 2016, "wins": 193, "losses": 130}, {"franchise": "Houston Rockets", "coach": "M. D'Antoni", "start": 2016, "end": 2020, "wins": 217, "losses": 101}, {"franchise": "Houston Rockets", "coach": "S. Silas", "start": 2020, "end": 2023, "wins": 59, "losses": 177}, {"franchise": "Houston Rockets", "coach": "I. Udoka", "start": 2023, "end": 2026, "wins": 127, "losses": 91}, {"franchise": "Indiana Pacers", "coach": "L. Staverman", "start": 1967, "end": 1969, "wins": 40, "losses": 47}, {"franchise": "Indiana Pacers", "coach": "S. Leonard", "start": 1969, "end": 1980, "wins": 487, "losses": 429}, {"franchise": "Indiana Pacers", "coach": "J. McKinney", "start": 1980, "end": 1984, "wins": 125, "losses": 203}, {"franchise": "Indiana Pacers", "coach": "G. Irvine", "start": 1984, "end": 1986, "wins": 48, "losses": 116}, {"franchise": "Indiana Pacers", "coach": "J. Ramsay", "start": 1986, "end": 1989, "wins": 79, "losses": 92}, {"franchise": "Indiana Pacers", "coach": "D. Versace", "start": 1989, "end": 1991, "wins": 51, "losses": 56}, {"franchise": "Indiana Pacers", "coach": "B. Hill", "start": 1991, "end": 1993, "wins": 81, "losses": 83}, {"franchise": "Indiana Pacers", "coach": "L. Brown", "start": 1993, "end": 1997, "wins": 190, "losses": 138}, {"franchise": "Indiana Pacers", "coach": "L. Bird", "start": 1997, "end": 2000, "wins": 147, "losses": 67}, {"franchise": "Indiana Pacers", "coach": "I. Thomas", "start": 2000, "end": 2003, "wins": 131, "losses": 115}, {"franchise": "Indiana Pacers", "coach": "R. Carlisle", "start": 2003, "end": 2007, "wins": 181, "losses": 147}, {"franchise": "Indiana Pacers", "coach": "J. O'Brien", "start": 2007, "end": 2011, "wins": 121, "losses": 169}, {"franchise": "Indiana Pacers", "coach": "F. Vogel", "start": 2011, "end": 2016, "wins": 230, "losses": 163}, {"franchise": "Indiana Pacers", "coach": "N. McMillan", "start": 2016, "end": 2020, "wins": 183, "losses": 136}, {"franchise": "Indiana Pacers", "coach": "N. Bjorkgren", "start": 2020, "end": 2021, "wins": 34, "losses": 38}, {"franchise": "Indiana Pacers", "coach": "R. Carlisle", "start": 2021, "end": 2026, "wins": 172, "losses": 213}, {"franchise": "Los Angeles Clippers", "coach": "D. Schayes", "start": 1970, "end": 1972, "wins": 22, "losses": 61}, {"franchise": "Los Angeles Clippers", "coach": "J. Ramsay", "start": 1972, "end": 1976, "wins": 158, "losses": 170}, {"franchise": "Los Angeles Clippers", "coach": "T. Locke", "start": 1976, "end": 1977, "wins": 16, "losses": 30}, {"franchise": "Los Angeles Clippers", "coach": "C. Fitzsimmons", "start": 1977, "end": 1978, "wins": 27, "losses": 55}, {"franchise": "Los Angeles Clippers", "coach": "G. Shue", "start": 1978, "end": 1980, "wins": 78, "losses": 86}, {"franchise": "Los Angeles Clippers", "coach": "P. Silas", "start": 1980, "end": 1983, "wins": 78, "losses": 168}, {"franchise": "Los Angeles Clippers", "coach": "J. Lynam", "start": 1983, "end": 1985, "wins": 52, "losses": 91}, {"franchise": "Los Angeles Clippers", "coach": "D. Chaney", "start": 1985, "end": 1987, "wins": 44, "losses": 120}, {"franchise": "Los Angeles Clippers", "coach": "G. Shue", "start": 1987, "end": 1989, "wins": 27, "losses": 93}, {"franchise": "Los Angeles Clippers", "coach": "D. Casey", "start": 1989, "end": 1990, "wins": 30, "losses": 52}, {"franchise": "Los Angeles Clippers", "coach": "M. Schuler", "start": 1990, "end": 1992, "wins": 52, "losses": 75}, {"franchise": "Los Angeles Clippers", "coach": "L. Brown", "start": 1992, "end": 1993, "wins": 41, "losses": 41}, {"franchise": "Los Angeles Clippers", "coach": "B. Weiss", "start": 1993, "end": 1994, "wins": 27, "losses": 55}, {"franchise": "Los Angeles Clippers", "coach": "B. Fitch", "start": 1994, "end": 1998, "wins": 99, "losses": 229}, {"franchise": "Los Angeles Clippers", "coach": "C. Ford", "start": 1998, "end": 2000, "wins": 20, "losses": 75}, {"franchise": "Los Angeles Clippers", "coach": "A. Gentry", "start": 2000, "end": 2003, "wins": 89, "losses": 133}, {"franchise": "Los Angeles Clippers", "coach": "M. Dunleavy", "start": 2003, "end": 2010, "wins": 215, "losses": 326}, {"franchise": "Los Angeles Clippers", "coach": "V. Del Negro", "start": 2010, "end": 2013, "wins": 128, "losses": 102}, {"franchise": "Los Angeles Clippers", "coach": "D. Rivers", "start": 2013, "end": 2020, "wins": 356, "losses": 208}, {"franchise": "Los Angeles Clippers", "coach": "T. Lue", "start": 2020, "end": 2026, "wins": 261, "losses": 195}, {"franchise": "Los Angeles Lakers", "coach": "J. Kundla", "start": 1948, "end": 1957, "wins": 380, "losses": 240}, {"franchise": "Los Angeles Lakers", "coach": "G. Mikan", "start": 1957, "end": 1958, "wins": 9, "losses": 30}, {"franchise": "Los Angeles Lakers", "coach": "J. Kundla", "start": 1958, "end": 1959, "wins": 33, "losses": 39}, {"franchise": "Los Angeles Lakers", "coach": "J. Castellani", "start": 1959, "end": 1960, "wins": 11, "losses": 25}, {"franchise": "Los Angeles Lakers", "coach": "F. Schaus", "start": 1960, "end": 1969, "wins": 315, "losses": 245}, {"franchise": "Los Angeles Lakers", "coach": "J. Mullaney", "start": 1969, "end": 1971, "wins": 94, "losses": 70}, {"franchise": "Los Angeles Lakers", "coach": "B. Sharman", "start": 1971, "end": 1976, "wins": 246, "losses": 164}, {"franchise": "Los Angeles Lakers", "coach": "J. West", "start": 1976, "end": 1979, "wins": 145, "losses": 101}, {"franchise": "Los Angeles Lakers", "coach": "J. McKinney", "start": 1979, "end": 1980, "wins": 10, "losses": 4}, {"franchise": "Los Angeles Lakers", "coach": "P. Westhead", "start": 1980, "end": 1982, "wins": 61, "losses": 32}, {"franchise": "Los Angeles Lakers", "coach": "P. Riley", "start": 1982, "end": 1990, "wins": 483, "losses": 173}, {"franchise": "Los Angeles Lakers", "coach": "M. Dunleavy", "start": 1990, "end": 1992, "wins": 101, "losses": 63}, {"franchise": "Los Angeles Lakers", "coach": "R. Pfund", "start": 1992, "end": 1994, "wins": 66, "losses": 80}, {"franchise": "Los Angeles Lakers", "coach": "D. Harris", "start": 1994, "end": 1999, "wins": 224, "losses": 116}, {"franchise": "Los Angeles Lakers", "coach": "P. Jackson", "start": 1999, "end": 2004, "wins": 287, "losses": 123}, {"franchise": "Los Angeles Lakers", "coach": "R. Tomjanovich", "start": 2004, "end": 2005, "wins": 24, "losses": 19}, {"franchise": "Los Angeles Lakers", "coach": "P. Jackson", "start": 2005, "end": 2011, "wins": 323, "losses": 169}, {"franchise": "Los Angeles Lakers", "coach": "M. Brown", "start": 2011, "end": 2013, "wins": 42, "losses": 29}, {"franchise": "Los Angeles Lakers", "coach": "M. D'Antoni", "start": 2013, "end": 2014, "wins": 27, "losses": 55}, {"franchise": "Los Angeles Lakers", "coach": "B. Scott", "start": 2014, "end": 2016, "wins": 38, "losses": 126}, {"franchise": "Los Angeles Lakers", "coach": "L. Walton", "start": 2016, "end": 2019, "wins": 98, "losses": 148}, {"franchise": "Los Angeles Lakers", "coach": "F. Vogel", "start": 2019, "end": 2022, "wins": 127, "losses": 98}, {"franchise": "Los Angeles Lakers", "coach": "D. Ham", "start": 2022, "end": 2024, "wins": 90, "losses": 74}, {"franchise": "Los Angeles Lakers", "coach": "J. Redick", "start": 2024, "end": 2026, "wins": 84, "losses": 53}, {"franchise": "Memphis Grizzlies", "coach": "B. Winters", "start": 1995, "end": 1997, "wins": 23, "losses": 102}, {"franchise": "Memphis Grizzlies", "coach": "B. Hill", "start": 1997, "end": 2000, "wins": 31, "losses": 123}, {"franchise": "Memphis Grizzlies", "coach": "S. Lowe", "start": 2000, "end": 2003, "wins": 46, "losses": 126}, {"franchise": "Memphis Grizzlies", "coach": "H. Brown", "start": 2003, "end": 2005, "wins": 55, "losses": 39}, {"franchise": "Memphis Grizzlies", "coach": "M. Fratello", "start": 2005, "end": 2007, "wins": 55, "losses": 57}, {"franchise": "Memphis Grizzlies", "coach": "M. Iavaroni", "start": 2007, "end": 2009, "wins": 33, "losses": 90}, {"franchise": "Memphis Grizzlies", "coach": "L. Hollins", "start": 2009, "end": 2013, "wins": 183, "losses": 129}, {"franchise": "Memphis Grizzlies", "coach": "D. Joerger", "start": 2013, "end": 2016, "wins": 147, "losses": 99}, {"franchise": "Memphis Grizzlies", "coach": "D. Fizdale", "start": 2016, "end": 2018, "wins": 50, "losses": 51}, {"franchise": "Memphis Grizzlies", "coach": "J. Bickerstaff", "start": 2018, "end": 2019, "wins": 33, "losses": 49}, {"franchise": "Memphis Grizzlies", "coach": "T. Jenkins", "start": 2019, "end": 2025, "wins": 250, "losses": 214}, {"franchise": "Memphis Grizzlies", "coach": "T. Iisalo", "start": 2025, "end": 2026, "wins": 21, "losses": 33}, {"franchise": "Miami Heat", "coach": "R. Rothstein", "start": 1988, "end": 1991, "wins": 57, "losses": 189}, {"franchise": "Miami Heat", "coach": "K. Loughery", "start": 1991, "end": 1995, "wins": 133, "losses": 159}, {"franchise": "Miami Heat", "coach": "P. Riley", "start": 1995, "end": 2003, "wins": 354, "losses": 270}, {"franchise": "Miami Heat", "coach": "S. Van Gundy", "start": 2003, "end": 2006, "wins": 112, "losses": 73}, {"franchise": "Miami Heat", "coach": "P. Riley", "start": 2006, "end": 2008, "wins": 59, "losses": 105}, {"franchise": "Miami Heat", "coach": "E. Spoelstra", "start": 2008, "end": 2026, "wins": 817, "losses": 599}, {"franchise": "Milwaukee Bucks", "coach": "L. Costello", "start": 1968, "end": 1977, "wins": 410, "losses": 264}, {"franchise": "Milwaukee Bucks", "coach": "D. Nelson", "start": 1977, "end": 1987, "wins": 513, "losses": 307}, {"franchise": "Milwaukee Bucks", "coach": "D. Harris", "start": 1987, "end": 1992, "wins": 191, "losses": 154}, {"franchise": "Milwaukee Bucks", "coach": "M. Dunleavy", "start": 1992, "end": 1996, "wins": 107, "losses": 221}, {"franchise": "Milwaukee Bucks", "coach": "C. Ford", "start": 1996, "end": 1998, "wins": 69, "losses": 95}, {"franchise": "Milwaukee Bucks", "coach": "G. Karl", "start": 1998, "end": 2003, "wins": 205, "losses": 173}, {"franchise": "Milwaukee Bucks", "coach": "T. Porter", "start": 2003, "end": 2005, "wins": 71, "losses": 93}, {"franchise": "Milwaukee Bucks", "coach": "T. Stotts", "start": 2005, "end": 2007, "wins": 63, "losses": 83}, {"franchise": "Milwaukee Bucks", "coach": "L. Krystkowiak", "start": 2007, "end": 2008, "wins": 26, "losses": 56}, {"franchise": "Milwaukee Bucks", "coach": "S. Skiles", "start": 2008, "end": 2013, "wins": 162, "losses": 182}, {"franchise": "Milwaukee Bucks", "coach": "L. Drew", "start": 2013, "end": 2014, "wins": 15, "losses": 67}, {"franchise": "Milwaukee Bucks", "coach": "J. Kidd", "start": 2014, "end": 2018, "wins": 139, "losses": 152}, {"franchise": "Milwaukee Bucks", "coach": "M. Budenholzer", "start": 2018, "end": 2023, "wins": 271, "losses": 120}, {"franchise": "Milwaukee Bucks", "coach": "A. Griffin", "start": 2023, "end": 2024, "wins": 30, "losses": 13}, {"franchise": "Milwaukee Bucks", "coach": "D. Rivers", "start": 2024, "end": 2026, "wins": 72, "losses": 64}, {"franchise": "Minnesota Timberwolves", "coach": "B. Musselman", "start": 1989, "end": 1991, "wins": 51, "losses": 113}, {"franchise": "Minnesota Timberwolves", "coach": "J. Rodgers", "start": 1991, "end": 1993, "wins": 21, "losses": 90}, {"franchise": "Minnesota Timberwolves", "coach": "S. Lowe", "start": 1993, "end": 1994, "wins": 20, "losses": 62}, {"franchise": "Minnesota Timberwolves", "coach": "B. Blair", "start": 1994, "end": 1996, "wins": 27, "losses": 75}, {"franchise": "Minnesota Timberwolves", "coach": "F. Saunders", "start": 1996, "end": 2005, "wins": 391, "losses": 284}, {"franchise": "Minnesota Timberwolves", "coach": "D. Casey", "start": 2005, "end": 2007, "wins": 53, "losses": 69}, {"franchise": "Minnesota Timberwolves", "coach": "R. Wittman", "start": 2007, "end": 2009, "wins": 26, "losses": 75}, {"franchise": "Minnesota Timberwolves", "coach": "K. Rambis", "start": 2009, "end": 2011, "wins": 32, "losses": 132}, {"franchise": "Minnesota Timberwolves", "coach": "R. Adelman", "start": 2011, "end": 2014, "wins": 97, "losses": 133}, {"franchise": "Minnesota Timberwolves", "coach": "F. Saunders", "start": 2014, "end": 2015, "wins": 16, "losses": 66}, {"franchise": "Minnesota Timberwolves", "coach": "S. Mitchell", "start": 2015, "end": 2016, "wins": 29, "losses": 53}, {"franchise": "Minnesota Timberwolves", "coach": "T. Thibodeau", "start": 2016, "end": 2019, "wins": 97, "losses": 107}, {"franchise": "Minnesota Timberwolves", "coach": "R. Saunders", "start": 2019, "end": 2021, "wins": 26, "losses": 69}, {"franchise": "Minnesota Timberwolves", "coach": "C. Finch", "start": 2021, "end": 2026, "wins": 228, "losses": 157}, {"franchise": "New Orleans Pelicans", "coach": "P. Silas", "start": 2002, "end": 2003, "wins": 47, "losses": 35}, {"franchise": "New Orleans Pelicans", "coach": "T. Floyd", "start": 2003, "end": 2004, "wins": 41, "losses": 41}, {"franchise": "New Orleans Pelicans", "coach": "B. Scott", "start": 2004, "end": 2010, "wins": 203, "losses": 216}, {"franchise": "New Orleans Pelicans", "coach": "M. Williams", "start": 2010, "end": 2015, "wins": 173, "losses": 221}, {"franchise": "New Orleans Pelicans", "coach": "A. Gentry", "start": 2015, "end": 2020, "wins": 175, "losses": 225}, {"franchise": "New Orleans Pelicans", "coach": "S. Van Gundy", "start": 2020, "end": 2021, "wins": 31, "losses": 41}, {"franchise": "New Orleans Pelicans", "coach": "W. Green", "start": 2021, "end": 2026, "wins": 150, "losses": 190}, {"franchise": "New York Knicks", "coach": "N. Cohalan", "start": 1946, "end": 1947, "wins": 33, "losses": 27}, {"franchise": "New York Knicks", "coach": "J. Lapchick", "start": 1947, "end": 1956, "wins": 326, "losses": 247}, {"franchise": "New York Knicks", "coach": "V. Boryla", "start": 1956, "end": 1958, "wins": 71, "losses": 73}, {"franchise": "New York Knicks", "coach": "A. Levane", "start": 1958, "end": 1960, "wins": 48, "losses": 51}, {"franchise": "New York Knicks", "coach": "C. Braun", "start": 1960, "end": 1961, "wins": 21, "losses": 58}, {"franchise": "New York Knicks", "coach": "E. Donovan", "start": 1961, "end": 1965, "wins": 84, "losses": 194}, {"franchise": "New York Knicks", "coach": "H. Gallatin", "start": 1965, "end": 1966, "wins": 6, "losses": 15}, {"franchise": "New York Knicks", "coach": "D. McGuire", "start": 1966, "end": 1968, "wins": 51, "losses": 68}, {"franchise": "New York Knicks", "coach": "R. Holzman", "start": 1968, "end": 1977, "wins": 438, "losses": 300}, {"franchise": "New York Knicks", "coach": "W. Reed", "start": 1977, "end": 1979, "wins": 49, "losses": 47}, {"franchise": "New York Knicks", "coach": "R. Holzman", "start": 1979, "end": 1982, "wins": 122, "losses": 124}, {"franchise": "New York Knicks", "coach": "H. Brown", "start": 1982, "end": 1987, "wins": 142, "losses": 202}, {"franchise": "New York Knicks", "coach": "R. Pitino", "start": 1987, "end": 1989, "wins": 90, "losses": 74}, {"franchise": "New York Knicks", "coach": "S. Jackson", "start": 1989, "end": 1991, "wins": 52, "losses": 45}, {"franchise": "New York Knicks", "coach": "P. Riley", "start": 1991, "end": 1995, "wins": 223, "losses": 105}, {"franchise": "New York Knicks", "coach": "D. Nelson", "start": 1995, "end": 1996, "wins": 34, "losses": 25}, {"franchise": "New York Knicks", "coach": "J. Van Gundy", "start": 1996, "end": 2002, "wins": 235, "losses": 162}, {"franchise": "New York Knicks", "coach": "D. Chaney", "start": 2002, "end": 2004, "wins": 52, "losses": 69}, {"franchise": "New York Knicks", "coach": "L. Wilkens", "start": 2004, "end": 2005, "wins": 17, "losses": 22}, {"franchise": "New York Knicks", "coach": "L. Brown", "start": 2005, "end": 2006, "wins": 23, "losses": 59}, {"franchise": "New York Knicks", "coach": "I. Thomas", "start": 2006, "end": 2008, "wins": 56, "losses": 108}, {"franchise": "New York Knicks", "coach": "M. D'Antoni", "start": 2008, "end": 2012, "wins": 121, "losses": 167}, {"franchise": "New York Knicks", "coach": "M. Woodson", "start": 2012, "end": 2014, "wins": 91, "losses": 73}, {"franchise": "New York Knicks", "coach": "D. Fisher", "start": 2014, "end": 2016, "wins": 40, "losses": 96}, {"franchise": "New York Knicks", "coach": "J. Hornacek", "start": 2016, "end": 2018, "wins": 60, "losses": 104}, {"franchise": "New York Knicks", "coach": "D. Fizdale", "start": 2018, "end": 2020, "wins": 21, "losses": 83}, {"franchise": "New York Knicks", "coach": "T. Thibodeau", "start": 2020, "end": 2025, "wins": 226, "losses": 174}, {"franchise": "New York Knicks", "coach": "M. Brown", "start": 2025, "end": 2026, "wins": 35, "losses": 21}, {"franchise": "Oklahoma City Thunder", "coach": "A. Bianchi", "start": 1967, "end": 1969, "wins": 53, "losses": 111}, {"franchise": "Oklahoma City Thunder", "coach": "L. Wilkens", "start": 1969, "end": 1972, "wins": 121, "losses": 125}, {"franchise": "Oklahoma City Thunder", "coach": "T. Nissalke", "start": 1972, "end": 1973, "wins": 13, "losses": 32}, {"franchise": "Oklahoma City Thunder", "coach": "B. Russell", "start": 1973, "end": 1977, "wins": 162, "losses": 166}, {"franchise": "Oklahoma City Thunder", "coach": "B. Hopkins", "start": 1977, "end": 1978, "wins": 5, "losses": 17}, {"franchise": "Oklahoma City Thunder", "coach": "L. Wilkens", "start": 1978, "end": 1985, "wins": 315, "losses": 259}, {"franchise": "Oklahoma City Thunder", "coach": "B. Bickerstaff", "start": 1985, "end": 1990, "wins": 202, "losses": 208}, {"franchise": "Oklahoma City Thunder", "coach": "K. Jones", "start": 1990, "end": 1992, "wins": 59, "losses": 59}, {"franchise": "Oklahoma City Thunder", "coach": "G. Karl", "start": 1992, "end": 1998, "wins": 357, "losses": 135}, {"franchise": "Oklahoma City Thunder", "coach": "P. Westphal", "start": 1998, "end": 2001, "wins": 76, "losses": 71}, {"franchise": "Oklahoma City Thunder", "coach": "N. McMillan", "start": 2001, "end": 2005, "wins": 174, "losses": 154}, {"franchise": "Oklahoma City Thunder", "coach": "B. Weiss", "start": 2005, "end": 2006, "wins": 13, "losses": 17}, {"franchise": "Oklahoma City Thunder", "coach": "B. Hill", "start": 2006, "end": 2007, "wins": 31, "losses": 51}, {"franchise": "Oklahoma City Thunder", "coach": "P. Carlesimo", "start": 2007, "end": 2009, "wins": 21, "losses": 74}, {"franchise": "Oklahoma City Thunder", "coach": "S. Brooks", "start": 2009, "end": 2015, "wins": 316, "losses": 160}, {"franchise": "Oklahoma City Thunder", "coach": "B. Donovan", "start": 2015, "end": 2020, "wins": 243, "losses": 157}, {"franchise": "Oklahoma City Thunder", "coach": "M. Daigneault", "start": 2020, "end": 2026, "wins": 254, "losses": 203}, {"franchise": "Orlando Magic", "coach": "M. Guokas", "start": 1989, "end": 1993, "wins": 111, "losses": 217}, {"franchise": "Orlando Magic", "coach": "B. Hill", "start": 1993, "end": 1997, "wins": 191, "losses": 104}, {"franchise": "Orlando Magic", "coach": "C. Daly", "start": 1997, "end": 1999, "wins": 74, "losses": 58}, {"franchise": "Orlando Magic", "coach": "D. Rivers", "start": 1999, "end": 2004, "wins": 171, "losses": 168}, {"franchise": "Orlando Magic", "coach": "J. Davis", "start": 2004, "end": 2005, "wins": 31, "losses": 33}, {"franchise": "Orlando Magic", "coach": "B. Hill", "start": 2005, "end": 2007, "wins": 76, "losses": 88}, {"franchise": "Orlando Magic", "coach": "S. Van Gundy", "start": 2007, "end": 2012, "wins": 259, "losses": 135}, {"franchise": "Orlando Magic", "coach": "J. Vaughn", "start": 2012, "end": 2015, "wins": 58, "losses": 158}, {"franchise": "Orlando Magic", "coach": "S. Skiles", "start": 2015, "end": 2016, "wins": 35, "losses": 47}, {"franchise": "Orlando Magic", "coach": "F. Vogel", "start": 2016, "end": 2018, "wins": 54, "losses": 110}, {"franchise": "Orlando Magic", "coach": "S. Clifford", "start": 2018, "end": 2021, "wins": 96, "losses": 131}, {"franchise": "Orlando Magic", "coach": "J. Mosley", "start": 2021, "end": 2026, "wins": 173, "losses": 209}, {"franchise": "Philadelphia 76ers", "coach": "A. Cervi", "start": 1949, "end": 1957, "wins": 294, "losses": 201}, {"franchise": "Philadelphia 76ers", "coach": "P. Seymour", "start": 1957, "end": 1960, "wins": 121, "losses": 98}, {"franchise": "Philadelphia 76ers", "coach": "A. Hannum", "start": 1960, "end": 1963, "wins": 127, "losses": 112}, {"franchise": "Philadelphia 76ers", "coach": "D. Schayes", "start": 1963, "end": 1966, "wins": 129, "losses": 111}, {"franchise": "Philadelphia 76ers", "coach": "A. Hannum", "start": 1966, "end": 1968, "wins": 130, "losses": 33}, {"franchise": "Philadelphia 76ers", "coach": "J. Ramsay", "start": 1968, "end": 1972, "wins": 174, "losses": 154}, {"franchise": "Philadelphia 76ers", "coach": "R. Rubin", "start": 1972, "end": 1973, "wins": 4, "losses": 47}, {"franchise": "Philadelphia 76ers", "coach": "G. Shue", "start": 1973, "end": 1978, "wins": 157, "losses": 177}, {"franchise": "Philadelphia 76ers", "coach": "B. Cunningham", "start": 1978, "end": 1985, "wins": 401, "losses": 173}, {"franchise": "Philadelphia 76ers", "coach": "M. Guokas", "start": 1985, "end": 1988, "wins": 119, "losses": 88}, {"franchise": "Philadelphia 76ers", "coach": "J. Lynam", "start": 1988, "end": 1992, "wins": 178, "losses": 150}, {"franchise": "Philadelphia 76ers", "coach": "D. Moe", "start": 1992, "end": 1993, "wins": 19, "losses": 37}, {"franchise": "Philadelphia 76ers", "coach": "F. Carter", "start": 1993, "end": 1994, "wins": 25, "losses": 57}, {"franchise": "Philadelphia 76ers", "coach": "J. Lucas", "start": 1994, "end": 1996, "wins": 42, "losses": 122}, {"franchise": "Philadelphia 76ers", "coach": "J. Davis", "start": 1996, "end": 1997, "wins": 22, "losses": 60}, {"franchise": "Philadelphia 76ers", "coach": "L. Brown", "start": 1997, "end": 2003, "wins": 255, "losses": 205}, {"franchise": "Philadelphia 76ers", "coach": "R. Ayers", "start": 2003, "end": 2004, "wins": 21, "losses": 31}, {"franchise": "Philadelphia 76ers", "coach": "J. O'Brien", "start": 2004, "end": 2005, "wins": 43, "losses": 39}, {"franchise": "Philadelphia 76ers", "coach": "M. Cheeks", "start": 2005, "end": 2009, "wins": 122, "losses": 147}, {"franchise": "Philadelphia 76ers", "coach": "E. Jordan", "start": 2009, "end": 2010, "wins": 27, "losses": 55}, {"franchise": "Philadelphia 76ers", "coach": "D. Collins", "start": 2010, "end": 2013, "wins": 110, "losses": 120}, {"franchise": "Philadelphia 76ers", "coach": "B. Brown", "start": 2013, "end": 2020, "wins": 221, "losses": 344}, {"franchise": "Philadelphia 76ers", "coach": "D. Rivers", "start": 2020, "end": 2023, "wins": 154, "losses": 82}, {"franchise": "Philadelphia 76ers", "coach": "N. Nurse", "start": 2023, "end": 2026, "wins": 101, "losses": 118}, {"franchise": "Phoenix Suns", "coach": "R. Kerr", "start": 1968, "end": 1970, "wins": 31, "losses": 89}, {"franchise": "Phoenix Suns", "coach": "C. Fitzsimmons", "start": 1970, "end": 1972, "wins": 97, "losses": 67}, {"franchise": "Phoenix Suns", "coach": "J. Colangelo", "start": 1972, "end": 1973, "wins": 35, "losses": 40}, {"franchise": "Phoenix Suns", "coach": "J. MacLeod", "start": 1973, "end": 1987, "wins": 579, "losses": 543}, {"franchise": "Phoenix Suns", "coach": "J. Wetzel", "start": 1987, "end": 1988, "wins": 28, "losses": 54}, {"franchise": "Phoenix Suns", "coach": "C. Fitzsimmons", "start": 1988, "end": 1992, "wins": 217, "losses": 111}, {"franchise": "Phoenix Suns", "coach": "P. Westphal", "start": 1992, "end": 1996, "wins": 191, "losses": 88}, {"franchise": "Phoenix Suns", "coach": "C. Fitzsimmons", "start": 1996, "end": 1997, "wins": 0, "losses": 8}, {"franchise": "Phoenix Suns", "coach": "D. Ainge", "start": 1997, "end": 2000, "wins": 96, "losses": 56}, {"franchise": "Phoenix Suns", "coach": "S. Skiles", "start": 2000, "end": 2002, "wins": 76, "losses": 57}, {"franchise": "Phoenix Suns", "coach": "F. Johnson", "start": 2002, "end": 2004, "wins": 52, "losses": 51}, {"franchise": "Phoenix Suns", "coach": "M. D'Antoni", "start": 2004, "end": 2008, "wins": 232, "losses": 96}, {"franchise": "Phoenix Suns", "coach": "T. Porter", "start": 2008, "end": 2009, "wins": 28, "losses": 23}, {"franchise": "Phoenix Suns", "coach": "A. Gentry", "start": 2009, "end": 2013, "wins": 140, "losses": 131}, {"franchise": "Phoenix Suns", "coach": "J. Hornacek", "start": 2013, "end": 2016, "wins": 101, "losses": 112}, {"franchise": "Phoenix Suns", "coach": "E. Watson", "start": 2016, "end": 2018, "wins": 24, "losses": 61}, {"franchise": "Phoenix Suns", "coach": "I. Kokoskov", "start": 2018, "end": 2019, "wins": 19, "losses": 63}, {"franchise": "Phoenix Suns", "coach": "M. Williams", "start": 2019, "end": 2023, "wins": 194, "losses": 115}, {"franchise": "Phoenix Suns", "coach": "F. Vogel", "start": 2023, "end": 2024, "wins": 49, "losses": 33}, {"franchise": "Phoenix Suns", "coach": "M. Budenholzer", "start": 2024, "end": 2025, "wins": 36, "losses": 46}, {"franchise": "Phoenix Suns", "coach": "J. Ott", "start": 2025, "end": 2026, "wins": 32, "losses": 24}, {"franchise": "Portland Trail Blazers", "coach": "R. Todd", "start": 1970, "end": 1972, "wins": 41, "losses": 97}, {"franchise": "Portland Trail Blazers", "coach": "J. McCloskey", "start": 1972, "end": 1974, "wins": 48, "losses": 116}, {"franchise": "Portland Trail Blazers", "coach": "L. Wilkens", "start": 1974, "end": 1976, "wins": 75, "losses": 89}, {"franchise": "Portland Trail Blazers", "coach": "J. Ramsay", "start": 1976, "end": 1986, "wins": 453, "losses": 367}, {"franchise": "Portland Trail Blazers", "coach": "M. Schuler", "start": 1986, "end": 1989, "wins": 127, "losses": 84}, {"franchise": "Portland Trail Blazers", "coach": "R. Adelman", "start": 1989, "end": 1994, "wins": 277, "losses": 133}, {"franchise": "Portland Trail Blazers", "coach": "P. Carlesimo", "start": 1994, "end": 1997, "wins": 137, "losses": 109}, {"franchise": "Portland Trail Blazers", "coach": "M. Dunleavy", "start": 1997, "end": 2001, "wins": 190, "losses": 106}, {"franchise": "Portland Trail Blazers", "coach": "M. Cheeks", "start": 2001, "end": 2005, "wins": 162, "losses": 139}, {"franchise": "Portland Trail Blazers", "coach": "N. McMillan", "start": 2005, "end": 2012, "wins": 266, "losses": 269}, {"franchise": "Portland Trail Blazers", "coach": "T. Stotts", "start": 2012, "end": 2021, "wins": 402, "losses": 318}, {"franchise": "Portland Trail Blazers", "coach": "C. Billups", "start": 2021, "end": 2025, "wins": 117, "losses": 211}, {"franchise": "Portland Trail Blazers", "coach": "T. Splitter", "start": 2025, "end": 2026, "wins": 27, "losses": 29}, {"franchise": "Sacramento Kings", "coach": "L. Harrison", "start": 1948, "end": 1955, "wins": 295, "losses": 181}, {"franchise": "Sacramento Kings", "coach": "B. Wanzer", "start": 1955, "end": 1959, "wins": 98, "losses": 136}, {"franchise": "Sacramento Kings", "coach": "T. Marshall", "start": 1959, "end": 1960, "wins": 19, "losses": 56}, {"franchise": "Sacramento Kings", "coach": "C. Wolf", "start": 1960, "end": 1963, "wins": 118, "losses": 121}, {"franchise": "Sacramento Kings", "coach": "J. McMahon", "start": 1963, "end": 1967, "wins": 187, "losses": 134}, {"franchise": "Sacramento Kings", "coach": "E. Jucker", "start": 1967, "end": 1969, "wins": 80, "losses": 84}, {"franchise": "Sacramento Kings", "coach": "B. Cousy", "start": 1969, "end": 1974, "wins": 141, "losses": 207}, {"franchise": "Sacramento Kings", "coach": "P. Johnson", "start": 1974, "end": 1978, "wins": 128, "losses": 155}, {"franchise": "Sacramento Kings", "coach": "C. Fitzsimmons", "start": 1978, "end": 1984, "wins": 248, "losses": 244}, {"franchise": "Sacramento Kings", "coach": "J. McKinney", "start": 1984, "end": 1985, "wins": 1, "losses": 8}, {"franchise": "Sacramento Kings", "coach": "P. Johnson", "start": 1985, "end": 1987, "wins": 51, "losses": 77}, {"franchise": "Sacramento Kings", "coach": "B. Russell", "start": 1987, "end": 1988, "wins": 17, "losses": 41}, {"franchise": "Sacramento Kings", "coach": "J. Reynolds", "start": 1988, "end": 1990, "wins": 34, "losses": 76}, {"franchise": "Sacramento Kings", "coach": "D. Motta", "start": 1990, "end": 1992, "wins": 32, "losses": 75}, {"franchise": "Sacramento Kings", "coach": "G. St. Jean", "start": 1992, "end": 1997, "wins": 159, "losses": 236}, {"franchise": "Sacramento Kings", "coach": "E. Jordan", "start": 1997, "end": 1998, "wins": 27, "losses": 55}, {"franchise": "Sacramento Kings", "coach": "R. Adelman", "start": 1998, "end": 2006, "wins": 395, "losses": 229}, {"franchise": "Sacramento Kings", "coach": "E. Musselman", "start": 2006, "end": 2007, "wins": 33, "losses": 49}, {"franchise": "Sacramento Kings", "coach": "R. Theus", "start": 2007, "end": 2009, "wins": 44, "losses": 62}, {"franchise": "Sacramento Kings", "coach": "P. Westphal", "start": 2009, "end": 2012, "wins": 51, "losses": 120}, {"franchise": "Sacramento Kings", "coach": "K. Smart", "start": 2012, "end": 2013, "wins": 28, "losses": 54}, {"franchise": "Sacramento Kings", "coach": "M. Malone", "start": 2013, "end": 2015, "wins": 39, "losses": 67}, {"franchise": "Sacramento Kings", "coach": "G. Karl", "start": 2015, "end": 2016, "wins": 33, "losses": 49}, {"franchise": "Sacramento Kings", "coach": "D. Joerger", "start": 2016, "end": 2019, "wins": 98, "losses": 148}, {"franchise": "Sacramento Kings", "coach": "L. Walton", "start": 2019, "end": 2022, "wins": 68, "losses": 93}, {"franchise": "Sacramento Kings", "coach": "M. Brown", "start": 2022, "end": 2025, "wins": 107, "losses": 88}, {"franchise": "Sacramento Kings", "coach": "D. Christie", "start": 2025, "end": 2026, "wins": 12, "losses": 45}, {"franchise": "San Antonio Spurs", "coach": "C. Hagan", "start": 1967, "end": 1970, "wins": 109, "losses": 90}, {"franchise": "San Antonio Spurs", "coach": "M. Williams", "start": 1970, "end": 1971, "wins": 5, "losses": 14}, {"franchise": "San Antonio Spurs", "coach": "T. Nissalke", "start": 1971, "end": 1972, "wins": 42, "losses": 42}, {"franchise": "San Antonio Spurs", "coach": "B. McCarthy", "start": 1972, "end": 1973, "wins": 24, "losses": 48}, {"franchise": "San Antonio Spurs", "coach": "T. Nissalke", "start": 1973, "end": 1975, "wins": 63, "losses": 49}, {"franchise": "San Antonio Spurs", "coach": "B. Bass", "start": 1975, "end": 1976, "wins": 50, "losses": 34}, {"franchise": "San Antonio Spurs", "coach": "D. Moe", "start": 1976, "end": 1980, "wins": 177, "losses": 135}, {"franchise": "San Antonio Spurs", "coach": "S. Albeck", "start": 1980, "end": 1983, "wins": 153, "losses": 93}, {"franchise": "San Antonio Spurs", "coach": "M. McHone", "start": 1983, "end": 1984, "wins": 11, "losses": 20}, {"franchise": "San Antonio Spurs", "coach": "C. Fitzsimmons", "start": 1984, "end": 1986, "wins": 76, "losses": 88}, {"franchise": "San Antonio Spurs", "coach": "B. Weiss", "start": 1986, "end": 1988, "wins": 59, "losses": 105}, {"franchise": "San Antonio Spurs", "coach": "L. Brown", "start": 1988, "end": 1992, "wins": 153, "losses": 131}, {"franchise": "San Antonio Spurs", "coach": "J. Tarkanian", "start": 1992, "end": 1993, "wins": 9, "losses": 11}, {"franchise": "San Antonio Spurs", "coach": "J. Lucas", "start": 1993, "end": 1994, "wins": 55, "losses": 27}, {"franchise": "San Antonio Spurs", "coach": "B. Hill", "start": 1994, "end": 1997, "wins": 124, "losses": 58}, {"franchise": "San Antonio Spurs", "coach": "G. Popovich", "start": 1997, "end": 2025, "wins": 1373, "losses": 777}, {"franchise": "San Antonio Spurs", "coach": "M. Johnson", "start": 2025, "end": 2026, "wins": 39, "losses": 16}, {"franchise": "Toronto Raptors", "coach": "B. Malone", "start": 1995, "end": 1996, "wins": 21, "losses": 61}, {"franchise": "Toronto Raptors", "coach": "D. Walker", "start": 1996, "end": 1998, "wins": 41, "losses": 90}, {"franchise": "Toronto Raptors", "coach": "B. Carter", "start": 1998, "end": 2000, "wins": 68, "losses": 64}, {"franchise": "Toronto Raptors", "coach": "L. Wilkens", "start": 2000, "end": 2003, "wins": 113, "losses": 133}, {"franchise": "Toronto Raptors", "coach": "K. O'Neill", "start": 2003, "end": 2004, "wins": 33, "losses": 49}, {"franchise": "Toronto Raptors", "coach": "S. Mitchell", "start": 2004, "end": 2009, "wins": 156, "losses": 189}, {"franchise": "Toronto Raptors", "coach": "J. Triano", "start": 2009, "end": 2011, "wins": 62, "losses": 102}, {"franchise": "Toronto Raptors", "coach": "D. Casey", "start": 2011, "end": 2018, "wins": 320, "losses": 238}, {"franchise": "Toronto Raptors", "coach": "N. Nurse", "start": 2018, "end": 2023, "wins": 227, "losses": 163}, {"franchise": "Toronto Raptors", "coach": "D. Rajakovic", "start": 2023, "end": 2026, "wins": 88, "losses": 132}, {"franchise": "Utah Jazz", "coach": "S. Robertson", "start": 1974, "end": 1976, "wins": 1, "losses": 14}, {"franchise": "Utah Jazz", "coach": "E. Baylor", "start": 1976, "end": 1979, "wins": 86, "losses": 134}, {"franchise": "Utah Jazz", "coach": "T. Nissalke", "start": 1979, "end": 1982, "wins": 60, "losses": 124}, {"franchise": "Utah Jazz", "coach": "F. Layden", "start": 1982, "end": 1989, "wins": 260, "losses": 249}, {"franchise": "Utah Jazz", "coach": "J. Sloan", "start": 1989, "end": 2011, "wins": 1087, "losses": 657}, {"franchise": "Utah Jazz", "coach": "T. Corbin", "start": 2011, "end": 2014, "wins": 104, "losses": 126}, {"franchise": "Utah Jazz", "coach": "Q. Snyder", "start": 2014, "end": 2022, "wins": 372, "losses": 264}, {"franchise": "Utah Jazz", "coach": "W. Hardy", "start": 2022, "end": 2026, "wins": 103, "losses": 200}, {"franchise": "Washington Wizards", "coach": "J. Pollard", "start": 1961, "end": 1962, "wins": 18, "losses": 62}, {"franchise": "Washington Wizards", "coach": "J. McMahon", "start": 1962, "end": 1963, "wins": 12, "losses": 26}, {"franchise": "Washington Wizards", "coach": "S. Leonard", "start": 1963, "end": 1964, "wins": 31, "losses": 49}, {"franchise": "Washington Wizards", "coach": "B. Jeannette", "start": 1964, "end": 1965, "wins": 37, "losses": 43}, {"franchise": "Washington Wizards", "coach": "P. Seymour", "start": 1965, "end": 1966, "wins": 38, "losses": 42}, {"franchise": "Washington Wizards", "coach": "M. Farmer", "start": 1966, "end": 1967, "wins": 1, "losses": 8}, {"franchise": "Washington Wizards", "coach": "G. Shue", "start": 1967, "end": 1973, "wins": 275, "losses": 217}, {"franchise": "Washington Wizards", "coach": "K. Jones", "start": 1973, "end": 1976, "wins": 155, "losses": 91}, {"franchise": "Washington Wizards", "coach": "D. Motta", "start": 1976, "end": 1980, "wins": 185, "losses": 143}, {"franchise": "Washington Wizards", "coach": "G. Shue", "start": 1980, "end": 1986, "wins": 231, "losses": 248}, {"franchise": "Washington Wizards", "coach": "K. Loughery", "start": 1986, "end": 1988, "wins": 50, "losses": 59}, {"franchise": "Washington Wizards", "coach": "W. Unseld", "start": 1988, "end": 1994, "wins": 172, "losses": 320}, {"franchise": "Washington Wizards", "coach": "J. Lynam", "start": 1994, "end": 1997, "wins": 82, "losses": 128}, {"franchise": "Washington Wizards", "coach": "B. Bickerstaff", "start": 1997, "end": 1999, "wins": 55, "losses": 59}, {"franchise": "Washington Wizards", "coach": "G. Heard", "start": 1999, "end": 2000, "wins": 14, "losses": 30}, {"franchise": "Washington Wizards", "coach": "L. Hamilton", "start": 2000, "end": 2001, "wins": 19, "losses": 63}, {"franchise": "Washington Wizards", "coach": "D. Collins", "start": 2001, "end": 2003, "wins": 74, "losses": 90}, {"franchise": "Washington Wizards", "coach": "E. Jordan", "start": 2003, "end": 2009, "wins": 197, "losses": 224}, {"franchise": "Washington Wizards", "coach": "F. Saunders", "start": 2009, "end": 2012, "wins": 51, "losses": 130}, {"franchise": "Washington Wizards", "coach": "R. Wittman", "start": 2012, "end": 2016, "wins": 160, "losses": 168}, {"franchise": "Washington Wizards", "coach": "S. Brooks", "start": 2016, "end": 2021, "wins": 183, "losses": 207}, {"franchise": "Washington Wizards", "coach": "W. Unseld", "start": 2021, "end": 2024, "wins": 77, "losses": 130}, {"franchise": "Washington Wizards", "coach": "B. Keefe", "start": 2024, "end": 2026, "wins": 34, "losses": 103}];

const TEAM_COLORS = {
  'Atlanta Hawks': '#E03A3E', 'Boston Celtics': '#007A33', 'Brooklyn Nets': '#444444',
  'Charlotte Hornets': '#1D1160', 'Chicago Bulls': '#CE1141', 'Cleveland Cavaliers': '#860038',
  'Dallas Mavericks': '#00538C', 'Denver Nuggets': '#0E2240', 'Detroit Pistons': '#C8102E',
  'Golden State Warriors': '#1D428A', 'Houston Rockets': '#CE1141', 'Indiana Pacers': '#002D62',
  'Los Angeles Clippers': '#C8102E', 'Los Angeles Lakers': '#552583', 'Memphis Grizzlies': '#5D76A9',
  'Miami Heat': '#98002E', 'Milwaukee Bucks': '#00471B', 'Minnesota Timberwolves': '#0C2340',
  'New Orleans Pelicans': '#0C2340', 'New York Knicks': '#006BB6', 'Oklahoma City Thunder': '#007AC1',
  'Orlando Magic': '#0077C0', 'Philadelphia 76ers': '#006BB6', 'Phoenix Suns': '#1D1160',
  'Portland Trail Blazers': '#E03A3E', 'Sacramento Kings': '#5A2D81', 'San Antonio Spurs': '#333333',
  'Toronto Raptors': '#CE1141', 'Utah Jazz': '#002B5C', 'Washington Wizards': '#002B5C'
};

const TEAM_ACCENT = {
  'Atlanta Hawks': '#C1D32F', 'Boston Celtics': '#BA9653', 'Brooklyn Nets': '#FFFFFF',
  'Charlotte Hornets': '#00788C', 'Chicago Bulls': '#FFFFFF', 'Cleveland Cavaliers': '#FDBB30',
  'Dallas Mavericks': '#B8C4CA', 'Denver Nuggets': '#FEC524', 'Detroit Pistons': '#1D428A',
  'Golden State Warriors': '#FFC72C', 'Houston Rockets': '#C4CED4', 'Indiana Pacers': '#FDBB30',
  'Los Angeles Clippers': '#1D428A', 'Los Angeles Lakers': '#FDB927', 'Memphis Grizzlies': '#12173F',
  'Miami Heat': '#F9A01B', 'Milwaukee Bucks': '#EEE1C6', 'Minnesota Timberwolves': '#236192',
  'New Orleans Pelicans': '#C8102E', 'New York Knicks': '#F58426', 'Oklahoma City Thunder': '#EF3B24',
  'Orlando Magic': '#C4CED4', 'Philadelphia 76ers': '#ED174C', 'Phoenix Suns': '#E56020',
  'Portland Trail Blazers': '#FFFFFF', 'Sacramento Kings': '#63727A', 'San Antonio Spurs': '#C4CED4',
  'Toronto Raptors': '#000000', 'Utah Jazz': '#F9A01B', 'Washington Wizards': '#E31837'
};

// Championships count by current franchise name (includes full franchise history)
const CHAMPIONSHIPS = {
  'Boston Celtics': 18, 'Los Angeles Lakers': 17, 'Golden State Warriors': 7,
  'Chicago Bulls': 6, 'San Antonio Spurs': 5, 'Miami Heat': 3, 'Detroit Pistons': 3,
  'Philadelphia 76ers': 3, 'Milwaukee Bucks': 2, 'New York Knicks': 2,
  'Houston Rockets': 2, 'Cleveland Cavaliers': 1, 'Dallas Mavericks': 1,
  'Washington Wizards': 1, 'Atlanta Hawks': 1, 'Sacramento Kings': 1,
  'Portland Trail Blazers': 1, 'Toronto Raptors': 1, 'Denver Nuggets': 1,
  'Oklahoma City Thunder': 0, 'Indiana Pacers': 0, 'Phoenix Suns': 0,
  'Utah Jazz': 0, 'Brooklyn Nets': 0, 'Los Angeles Clippers': 0,
  'Minnesota Timberwolves': 0, 'New Orleans Pelicans': 0, 'Memphis Grizzlies': 0,
  'Orlando Magic': 0, 'Charlotte Hornets': 0,
};

// Coach championship rings won as head coach (deduplicated)
const COACH_CHAMPS = {
  'R. Auerbach':    9,
  'B. Russell':     2,
  'T. Heinsohn':    2,
  'B. Fitch':       1,
  'K. Jones':       2,
  'P. Riley':       5,
  'P. Jackson':     11,
  'C. Daly':        2,
  'L. Costello':    1,
  'D. Nelson':      0,
  'A. Hannum':      2,
  'B. Sharman':     1,
  'J. Kundla':      5,
  'R. Tomjanovich': 2,
  'G. Popovich':    5,
  'L. Brown':       1,
  'E. Spoelstra':   3,
  'S. Kerr':        4,
  'T. Lue':         1,
  'B. Hill':        0,
  'S. Van Gundy':   1,
  'F. Vogel':       1,
  'N. Nurse':       1,
  'R. Carlisle':    1,
  'J. Mazzulla':    1,
  'I. Udoka':       0,
  'D. Casey':       0,
  'B. Stevens':     0,
  'D. Rivers':      0,
  'M. Budenholzer': 1,
  'M. Malone':      1,
  'B. Cunningham':  1,
  'A. Attles':      1,
  'J. Ramsay':      1,
  'L. Harrison':    1,
  'E. Gottlieb':    1,
  'D. Moe':         0,
  'K. Loughery':    0,
};

// Lookup: returns championships for a coach+franchise block
function coachChamps(coach, franchise, start, end) {
  if (coach === 'P. Riley') {
    const lakersRings = franchise === 'Los Angeles Lakers' ? 4 : 0;
    // Riley won with Miami in 2006; his Miami stints are 1995-2003 and 2006-2008
    const miamiRings = (franchise === 'Miami Heat' && start <= 2006 && end >= 2006) ? 1 : 0;
    return lakersRings + miamiRings;
  }
  if (coach === 'P. Jackson') {
    const bullsRings  = franchise === 'Chicago Bulls' ? 6 : 0;
    const lakersRings = franchise === 'Los Angeles Lakers' ? 5 : 0;
    return bullsRings + lakersRings;
  }
  if (coach === 'A. Hannum') {
    if (franchise === 'Atlanta Hawks') return 1;       // 1958 title
    if (franchise === 'Philadelphia 76ers') return 1;  // 1967 title
    return 0;
  }
  if (coach === 'L. Brown') {
    return franchise === 'Detroit Pistons' ? 1 : 0;
  }
  if (coach === 'S. Van Gundy') {
    // Won with Miami in 2006; his Miami stint is 2003-2006
    return (franchise === 'Miami Heat' && start <= 2006 && end >= 2006) ? 1 : 0;
  }
  return COACH_CHAMPS[coach] ?? 0;
}

const FRANCHISE_STATS = {
  'Atlanta Hawks':           { winPct: '.493', playoffs: 49, confFinals: 14, finals: 4,  champs: 1  },
  'Boston Celtics':          { winPct: '.597', playoffs: 62, confFinals: 39, finals: 23, champs: 18 },
  'Brooklyn Nets':           { winPct: '.423', playoffs: 24, confFinals: 2,  finals: 2,  champs: 0  },
  'Charlotte Hornets':       { winPct: '.428', playoffs: 10, confFinals: 0,  finals: 0,  champs: 0  },
  'Chicago Bulls':           { winPct: '.507', playoffs: 36, confFinals: 11, finals: 6,  champs: 6  },
  'Cleveland Cavaliers':     { winPct: '.475', playoffs: 25, confFinals: 8,  finals: 5,  champs: 1  },
  'Dallas Mavericks':        { winPct: '.504', playoffs: 25, confFinals: 6,  finals: 3,  champs: 1  },
  'Denver Nuggets':          { winPct: '.509', playoffs: 31, confFinals: 5,  finals: 1,  champs: 1  },
  'Detroit Pistons':         { winPct: '.475', playoffs: 43, confFinals: 17, finals: 7,  champs: 3  },
  'Golden State Warriors':   { winPct: '.488', playoffs: 38, confFinals: 18, finals: 12, champs: 7  },
  'Houston Rockets':         { winPct: '.518', playoffs: 35, confFinals: 8,  finals: 4,  champs: 2  },
  'Indiana Pacers':          { winPct: '.499', playoffs: 29, confFinals: 10, finals: 2,  champs: 0  },
  'Los Angeles Clippers':    { winPct: '.427', playoffs: 19, confFinals: 1,  finals: 0,  champs: 0  },
  'Los Angeles Lakers':      { winPct: '.592', playoffs: 65, confFinals: 43, finals: 32, champs: 17 },
  'Memphis Grizzlies':       { winPct: '.436', playoffs: 14, confFinals: 1,  finals: 0,  champs: 0  },
  'Miami Heat':              { winPct: '.525', playoffs: 26, confFinals: 10, finals: 7,  champs: 3  },
  'Milwaukee Bucks':         { winPct: '.528', playoffs: 37, confFinals: 10, finals: 3,  champs: 2  },
  'Minnesota Timberwolves':  { winPct: '.420', playoffs: 13, confFinals: 3,  finals: 0,  champs: 0  },
  'New Orleans Pelicans':    { winPct: '.455', playoffs: 9,  confFinals: 0,  finals: 0,  champs: 0  },
  'New York Knicks':         { winPct: '.490', playoffs: 46, confFinals: 17, finals: 8,  champs: 2  },
  'Oklahoma City Thunder':   { winPct: '.544', playoffs: 34, confFinals: 11, finals: 5,  champs: 2  },
  'Orlando Magic':           { winPct: '.471', playoffs: 18, confFinals: 4,  finals: 2,  champs: 0  },
  'Philadelphia 76ers':      { winPct: '.519', playoffs: 54, confFinals: 21, finals: 9,  champs: 3  },
  'Phoenix Suns':            { winPct: '.535', playoffs: 33, confFinals: 10, finals: 3,  champs: 0  },
  'Portland Trail Blazers':  { winPct: '.523', playoffs: 37, confFinals: 7,  finals: 3,  champs: 1  },
  'Sacramento Kings':        { winPct: '.456', playoffs: 30, confFinals: 8,  finals: 1,  champs: 1  },
  'San Antonio Spurs':       { winPct: '.594', playoffs: 39, confFinals: 14, finals: 6,  champs: 5  },
  'Toronto Raptors':         { winPct: '.474', playoffs: 13, confFinals: 2,  finals: 1,  champs: 1  },
  'Utah Jazz':               { winPct: '.532', playoffs: 31, confFinals: 6,  finals: 2,  champs: 0  },
  'Washington Wizards':      { winPct: '.441', playoffs: 30, confFinals: 5,  finals: 4,  champs: 1  },
};

const FRANCHISES = [...new Set(RAW_DATA.map(d => d.franchise))].sort();
const MIN_YEAR = 1946;
const MAX_YEAR = 2026;

function YearRangeSlider({ min, max, start, end, onChange }) {
  const trackRef = useRef(null);
  const [dragging, setDragging] = useState(null);

  const pct = (val) => ((val - min) / (max - min)) * 100;

  const valueFromEvent = (e) => {
    const rect = trackRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return Math.round(min + ratio * (max - min));
  };

  const handleMouseDown = (handle) => (e) => {
    e.preventDefault();
    setDragging(handle);
  };

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => {
      const val = valueFromEvent(e);
      if (dragging === 'start') {
        onChange(Math.min(val, end - 1), end);
      } else {
        onChange(start, Math.max(val, start + 1));
      }
    };
    const onUp = () => setDragging(null);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove);
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [dragging, start, end]);

  const TRACK_W = 180;
  const HANDLE_R = 8;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, userSelect: 'none' }}>
      <span style={{
        fontSize: 12, fontWeight: 700, color: '#555', fontFamily: "'Barlow Condensed', sans-serif",
        minWidth: 36, textAlign: 'right'
      }}>{start}</span>
      <div ref={trackRef} style={{
        position: 'relative', width: TRACK_W, height: 20, cursor: 'crosshair',
        display: 'flex', alignItems: 'center',
      }}>
        <div style={{
          position: 'absolute', left: 0, right: 0, height: 4,
          background: '#e0e0e0', borderRadius: 2,
        }} />
        <div style={{
          position: 'absolute',
          left: `${pct(start)}%`,
          width: `${pct(end) - pct(start)}%`,
          height: 4, background: '#1a1a2e', borderRadius: 2,
          transition: dragging ? 'none' : 'all 0.1s',
        }} />
        <div
          onMouseDown={handleMouseDown('start')}
          onTouchStart={handleMouseDown('start')}
          style={{
            position: 'absolute',
            left: `calc(${pct(start)}% - ${HANDLE_R}px)`,
            width: HANDLE_R * 2, height: HANDLE_R * 2,
            borderRadius: '50%',
            background: dragging === 'start' ? '#c0392b' : '#1a1a2e',
            border: '2px solid #fff',
            boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
            cursor: 'ew-resize',
            zIndex: 2,
            transition: dragging === 'start' ? 'none' : 'left 0.05s, background 0.15s',
          }}
        />
        <div
          onMouseDown={handleMouseDown('end')}
          onTouchStart={handleMouseDown('end')}
          style={{
            position: 'absolute',
            left: `calc(${pct(end)}% - ${HANDLE_R}px)`,
            width: HANDLE_R * 2, height: HANDLE_R * 2,
            borderRadius: '50%',
            background: dragging === 'end' ? '#c0392b' : '#1a1a2e',
            border: '2px solid #fff',
            boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
            cursor: 'ew-resize',
            zIndex: 2,
            transition: dragging === 'end' ? 'none' : 'left 0.05s, background 0.15s',
          }}
        />
      </div>
      <span style={{
        fontSize: 12, fontWeight: 700, color: '#555', fontFamily: "'Barlow Condensed', sans-serif",
        minWidth: 36,
      }}>{end}</span>
    </div>
  );
}

export default function App() {
  const [tooltip, setTooltip] = useState(null);
  const [franchiseTip, setFranchiseTip] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedFranchise, setSelectedFranchise] = useState(null);
  const [viewStart, setViewStart] = useState(MIN_YEAR);
  const [viewEnd, setViewEnd] = useState(MAX_YEAR);
  const [sortMode, setSortMode] = useState('champ');
  // svgRef removed — was declared but never used

  const ROW_H = 28;
  const LABEL_W = 185;
  const PAD_TOP = 50;
  const PAD_BOT = 30;

  const sortedFranchises = [...FRANCHISES].sort((a, b) => {
    if (sortMode === 'champ') {
      const diff = (CHAMPIONSHIPS[b] ?? 0) - (CHAMPIONSHIPS[a] ?? 0);
      return diff !== 0 ? diff : a.localeCompare(b);
    }
    if (sortMode === 'coaches') {
      return RAW_DATA.filter(d => d.franchise === b).length - RAW_DATA.filter(d => d.franchise === a).length;
    }
    if (sortMode === 'longestTenure') {
      const longest = f => Math.max(...RAW_DATA.filter(d => d.franchise === f).map(d => d.end - d.start));
      return longest(b) - longest(a);
    }
    return a.localeCompare(b);
  });

  const filteredFranchises = sortedFranchises.filter(f =>
    f.toLowerCase().includes(search.toLowerCase()) ||
    RAW_DATA.some(d => d.franchise === f && d.coach.toLowerCase().includes(search.toLowerCase()))
  );

  const svgW = 900;
  const svgH = PAD_TOP + filteredFranchises.length * ROW_H + PAD_BOT;

  const yearSpan = viewEnd - viewStart;
  const chartW = svgW - LABEL_W - 20;

  const xScale = (yr) => LABEL_W + ((yr - viewStart) / yearSpan) * chartW;

  const decadeTicks = [];
  for (let yr = Math.ceil(viewStart / 10) * 10; yr <= viewEnd; yr += 10) {
    decadeTicks.push(yr);
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#ffffff',
      fontFamily: "'Barlow Condensed', 'Roboto Condensed', sans-serif",
      color: '#222',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@300;400;600;700;800&display=swap');
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #f0f0f0; }
        ::-webkit-scrollbar-thumb { background: #ccc; border-radius: 3px; }
        .block-rect { transition: opacity 0.15s; cursor: pointer; }
        .block-rect:hover { opacity: 0.82; }
        .ctrl-btn { background: #fff; border: 1.5px solid #ddd; color: #555; padding: 5px 14px;
          border-radius: 20px; cursor: pointer; font-family: inherit; font-size: 12px; font-weight: 600; transition: all 0.15s; }
        .ctrl-btn:hover { background: #f5f5f5; border-color: #aaa; color: #111; }
        .ctrl-btn.active { background: #1a1a2e; border-color: #1a1a2e; color: #fff; }
        input[type=text] { background: #fff; border: 1.5px solid #ddd; color: #222;
          padding: 5px 12px; border-radius: 20px; font-family: inherit; font-size: 13px; width: 200px; }
        input[type=text]::placeholder { color: #bbb; }
        input[type=text]:focus { outline: none; border-color: #999; }
        .franchise-row { cursor: pointer; }
        .franchise-row:hover text { fill: #000 !important; }
      `}</style>

      {/* Header */}
      <div style={{ padding: '24px 32px 16px', borderBottom: '2px solid #ebebeb' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
          <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: '-0.5px',
            background: 'linear-gradient(90deg, #1a1a2e 0%, #c0392b 50%, #e67e22 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            NBA HEAD COACHING TIMELINES
          </h1>
          <span style={{ color: '#aaa', fontSize: 13 }}>1946 – 2026 · {RAW_DATA.length} coaching stints</span>
        </div>
        <p style={{ margin: '6px 0 0', color: '#888', fontSize: 13, fontWeight: 400 }}>
          Every head coach for all 30 franchises · Hover a block for details
        </p>
      </div>

      {/* Controls */}
      <div style={{ padding: '12px 32px', borderBottom: '1px solid #efefef', background: '#fafafa',
        display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ color: '#aaa', fontSize: 11, fontWeight: 700, letterSpacing: '0.8px', marginRight: 4 }}>SORT</span>
          {[['champ','🏆 Championships'],['alpha','A–Z'],['coaches','Most Coaches'],['longestTenure','Longest Tenure']].map(([k,l]) => (
            <button key={k} className={`ctrl-btn ${sortMode===k?'active':''}`} onClick={() => setSortMode(k)}>{l}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ color: '#aaa', fontSize: 11, fontWeight: 700, letterSpacing: '0.8px', marginRight: 4 }}>SEARCH</span>
          <input type="text" placeholder="Team or coach name…" value={search}
            onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ color: '#aaa', fontSize: 11, fontWeight: 700, letterSpacing: '0.8px' }}>ERA</span>
          {[[MIN_YEAR, MAX_YEAR,'All Time'],[1980,MAX_YEAR,'Since 1980'],[2000,MAX_YEAR,'Since 2000']].map(([s,e,l]) => (
            <button key={l} className={`ctrl-btn ${viewStart===s&&viewEnd===e?'active':''}`}
              onClick={()=>{setViewStart(s);setViewEnd(e)}}>{l}</button>
          ))}
          <YearRangeSlider
            min={MIN_YEAR} max={MAX_YEAR}
            start={viewStart} end={viewEnd}
            onChange={(s, e) => { setViewStart(s); setViewEnd(e); }}
          />
        </div>
        {selectedFranchise && (
          <button className="ctrl-btn" style={{ borderColor: '#E03A3E', color: '#c0392b' }}
            onClick={() => setSelectedFranchise(null)}>
            ✕ {selectedFranchise}
          </button>
        )}
      </div>

      {/* Chart */}
      <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
        <svg width={svgW} height={svgH} style={{ display: 'block', margin: '0 auto' }}>

          {/* Decade grid lines */}
          {decadeTicks.map(yr => (
            <g key={yr}>
              <line x1={xScale(yr)} x2={xScale(yr)} y1={PAD_TOP - 10} y2={svgH - PAD_BOT}
                stroke="#e8e8e8" strokeWidth={1} />
              <text x={xScale(yr)} y={PAD_TOP - 14} textAnchor="middle"
                fill="#aaa" fontSize={11} fontFamily="'Barlow Condensed', sans-serif" fontWeight={600}>
                {yr}
              </text>
            </g>
          ))}

          {/* Rows */}
          {filteredFranchises.map((franchise, fi) => {
            const y = PAD_TOP + fi * ROW_H;
            const color = TEAM_COLORS[franchise] || '#444';
            const accent = TEAM_ACCENT[franchise] || '#fff';
            const isSelected = selectedFranchise === franchise;
            const isHighlighted = !selectedFranchise || isSelected;
            const teamBlocks = RAW_DATA.filter(d => d.franchise === franchise &&
              d.end > viewStart && d.start < viewEnd);

            return (
              <g key={franchise} className="franchise-row"
                onClick={() => setSelectedFranchise(isSelected ? null : franchise)}>
                {/* Subtle row background */}
                <rect x={0} y={y} width={svgW} height={ROW_H - 1}
                  fill={fi % 2 === 0 ? '#fafafa' : '#ffffff'}
                  opacity={isHighlighted ? 1 : 0.4} />

                {/* Team label */}
                <text x={LABEL_W - 8} y={y + ROW_H / 2 + 4}
                  textAnchor="end" fontSize={11}
                  fontFamily="'Barlow Condensed', sans-serif" fontWeight={600}
                  fill={isSelected ? '#000' : isHighlighted ? '#333' : '#bbb'}
                  style={{ transition: 'fill 0.15s', cursor: 'pointer' }}
                  onMouseEnter={(e) => {
                    const allBlocks = RAW_DATA.filter(d => d.franchise === franchise);
                    const numCoaches = new Set(allBlocks.map(d => d.coach)).size;
                    setFranchiseTip({ franchise, numCoaches, x: e.clientX, y: e.clientY });
                  }}
                  onMouseMove={(e) => setFranchiseTip(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null)}
                  onMouseLeave={() => setFranchiseTip(null)}>
                  {franchise.replace('Los Angeles ', 'LA ').replace('Oklahoma City ', 'OKC ')}{sortMode === 'champ' && (CHAMPIONSHIPS[franchise] ?? 0) > 0 ? `  🏆${CHAMPIONSHIPS[franchise]}` : ''}
                </text>

                {/* Baseline */}
                <line x1={LABEL_W} x2={svgW - 10} y1={y + ROW_H / 2}
                  y2={y + ROW_H / 2} stroke="#ececec" strokeWidth={1} />

                {/* Coach blocks */}
                {teamBlocks.map((block, bi) => {
                  const x1 = Math.max(xScale(block.start), xScale(viewStart));
                  const x2 = Math.min(xScale(block.end), xScale(viewEnd));
                  const w = x2 - x1;
                  if (w <= 0) return null;
                  const total = block.wins + block.losses;
                  const winPct = total > 0 ? block.wins / total : 0;
                  const blockH = 18;
                  const by = y + (ROW_H - blockH) / 2;
                  const alpha = isHighlighted ? 1 : 0.2;

                  return (
                    <g key={bi}
                      onMouseEnter={(e) => setTooltip({ block, x: e.clientX, y: e.clientY })}
                      onMouseLeave={() => setTooltip(null)}
                      onMouseMove={(e) => setTooltip(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null)}>
                      <rect className="block-rect"
                        x={x1} y={by} width={w} height={blockH} rx={2}
                        fill={color} opacity={alpha}
                      />
                      <rect x={x1} y={by} width={w * winPct} height={blockH} rx={2}
                        fill={accent} opacity={alpha * 0.25} style={{ pointerEvents: 'none' }} />
                      <rect x={x1} y={by} width={w} height={2} rx={0}
                        fill={accent} opacity={alpha * 0.7} style={{ pointerEvents: 'none' }} />
                      {w > 30 && (
                        <text x={x1 + w / 2} y={by + blockH / 2 + 4}
                          textAnchor="middle" fontSize={Math.min(10, w / block.coach.length * 1.6)}
                          fontFamily="'Barlow Condensed', sans-serif" fontWeight={600}
                          fill="#fff" opacity={alpha * 0.9}
                          style={{ pointerEvents: 'none' }}>
                          {w > 60 ? block.coach : block.coach.split(' ')[1] || block.coach}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
            );
          })}

          {/* Bottom axis */}
          <line x1={LABEL_W} x2={svgW - 10} y1={svgH - PAD_BOT + 4} y2={svgH - PAD_BOT + 4}
            stroke="#ddd" strokeWidth={1} />
        </svg>
      </div>

      {/* Franchise tooltip */}
      {franchiseTip && (() => {
        const fs = FRANCHISE_STATS[franchiseTip.franchise] || {};
        const color = TEAM_COLORS[franchiseTip.franchise] || '#333';
        return (
          <div style={{
            position: 'fixed', left: franchiseTip.x + 14, top: franchiseTip.y - 10,
            background: '#fff',
            border: `2px solid ${color}`,
            borderRadius: 10, padding: '12px 16px',
            pointerEvents: 'none', zIndex: 9999, minWidth: 230,
            boxShadow: '0 4px 24px rgba(0,0,0,0.13)',
            fontFamily: "'Barlow Condensed', Arial Narrow, sans-serif",
          }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#111', marginBottom: 2 }}>
              {franchiseTip.franchise}
            </div>
            <div style={{ width: '100%', height: 3, background: color, borderRadius: 2, marginBottom: 10, opacity: 0.7 }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 14px', fontSize: 13 }}>
              <div style={{ color: '#888', fontWeight: 600 }}>COACHES (ALL-TIME)</div>
              <div style={{ color: '#111', fontWeight: 700 }}>{franchiseTip.numCoaches}</div>
              <div style={{ color: '#888', fontWeight: 600 }}>REG. SEASON WIN %</div>
              <div style={{ color: '#111', fontWeight: 700 }}>{fs.winPct ?? '—'}</div>
              <div style={{ color: '#888', fontWeight: 600 }}>PLAYOFF APPEARANCES</div>
              <div style={{ color: '#111', fontWeight: 700 }}>{fs.playoffs ?? '—'}</div>
              <div style={{ color: '#888', fontWeight: 600 }}>CONF. FINALS</div>
              <div style={{ color: '#111', fontWeight: 700 }}>{fs.confFinals ?? '—'}</div>
              <div style={{ color: '#888', fontWeight: 600 }}>FINALS APPEARANCES</div>
              <div style={{ color: '#111', fontWeight: 700 }}>{fs.finals ?? '—'}</div>
              <div style={{ color: '#888', fontWeight: 600 }}>CHAMPIONSHIPS</div>
              <div style={{ fontWeight: 800, color: fs.champs > 0 ? '#b8860b' : '#bbb', fontSize: 14 }}>
                {fs.champs > 0 ? '🏆'.repeat(Math.min(fs.champs, 10)) + (fs.champs > 10 ? ` ×${fs.champs}` : '') : '—'}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Coach tooltip */}
      {tooltip && (
        <div style={{
          position: 'fixed',
          left: tooltip.x + 14,
          top: tooltip.y - 10,
          background: '#ffffff',
          border: `1.5px solid ${TEAM_COLORS[tooltip.block.franchise] || '#ccc'}`,
          borderRadius: 8,
          padding: '10px 14px',
          pointerEvents: 'none',
          zIndex: 9999,
          minWidth: 190,
          boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
        }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 2 }}>
            {tooltip.block.coach}
          </div>
          <div style={{ fontSize: 12, color: TEAM_COLORS[tooltip.block.franchise] || '#888',
            marginBottom: 6, fontWeight: 700 }}>
            {tooltip.block.franchise}
          </div>
          <div style={{ fontSize: 12, color: '#666' }}>
            <span style={{ color: '#444' }}>{tooltip.block.start}–{tooltip.block.end}</span>
            &nbsp;·&nbsp;{tooltip.block.end - tooltip.block.start} {tooltip.block.end - tooltip.block.start === 1 ? 'season' : 'seasons'}
          </div>
          <div style={{ fontSize: 13, color: '#333', marginTop: 4 }}>
            <span style={{ color: '#2e7d32', fontWeight: 700 }}>{tooltip.block.wins}W</span>
            <span style={{ color: '#ccc' }}> – </span>
            <span style={{ color: '#c62828', fontWeight: 700 }}>{tooltip.block.losses}L</span>
            <span style={{ color: '#888', fontSize: 11 }}>&nbsp;
              ({((tooltip.block.wins / (tooltip.block.wins + tooltip.block.losses)) * 100).toFixed(1)}% win)
            </span>
          </div>
          {(() => {
            const rings = coachChamps(tooltip.block.coach, tooltip.block.franchise, tooltip.block.start, tooltip.block.end);
            return rings > 0 ? (
              <div style={{ marginTop: 6, fontSize: 13, fontWeight: 700, color: '#b8860b' }}>
                {'🏆'.repeat(rings)}{rings > 1 ? ` ${rings} championships` : ' 1 championship'}
              </div>
            ) : null;
          })()}
        </div>
      )}

      {/* Legend */}
      <div style={{ padding: '12px 32px', borderTop: '1px solid #efefef', background: '#fafafa',
        display: 'flex', gap: 20, alignItems: 'center', color: '#aaa', fontSize: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 24, height: 10, background: '#1D428A', borderRadius: 2,
            position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '70%', height: '100%',
              background: 'rgba(255,199,44,0.25)' }} />
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 2,
              background: 'rgba(255,199,44,0.7)' }} />
          </div>
          Block color = team primary · Fill = Coach Win %
        </div>
        <div>· Hover any block for coach stats</div>
        <div>· Click team name to highlight</div>
      </div>
    </div>
  );
}
