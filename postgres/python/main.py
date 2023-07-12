import psycopg2
import csv

#this script was used to import the journey data in to the database
#station data was imported with pgAdmin4

# Connect to the database
conn = psycopg2.connect(
    host='localhost',
    port='5432',
    dbname='citybike',
    user='postgres',
    password=''
)

# Create a cursor
cur = conn.cursor()

def validate_data(data):
    if data['Covered distance (m)'] < 10:
        return False
    if data['Duration (sec.)'] < 10:
        return False
    return True

# change the filename here to import another file
with open('2021-07.csv', newline='', encoding='utf-8-sig') as csvfile:
    reader = csv.DictReader(csvfile)
    
    # skip header
    next(reader)

    # Iterate over the rows in the CSV file
    for row in reader:
        try:
            row['Covered distance (m)'] = int(float(row['Covered distance (m)']))
            row['Duration (sec.)'] = int(float(row['Duration (sec.)']))
            row['Return station id'] = int(row['Return station id'])
            row['Departure station id'] = int(row['Departure station id'])
        except:
            print('ERROR converting strings to int',row)
            #skipped empty strings with this except
            continue
        if validate_data(row):
            cur.execute("INSERT INTO journey (departure_time, return_time, departure_station_id, departure_station_nimi, return_station_id, return_station_nimi, covered_distance, duration) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)",
                        (row['Departure'], row['Return'], row['Departure station id'],
                         row['Departure station name'], row['Return station id'], row['Return station name'],
                         row['Covered distance (m)'], row['Duration (sec.)']))
        else:
            print("Invalid data: ", row)

conn.commit()
cur.close()
conn.close()
