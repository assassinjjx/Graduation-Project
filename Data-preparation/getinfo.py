import xlwt,time
from lxml import etree
import requests
import os 
headers = {'User-Agent':'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36'}

all_info_list = []      #初始化列表，存入爬虫数据

def getInfo(url):
    r = requests.get(url, headers=headers)
    selector = etree.HTML(r.text)
    infos = selector.xpath('//div[@class="bookbox fl"]|//div[@class="bookbox fr"]')     #定位大标签，以此循环
    for info in infos:
        img = info.xpath('div[1]/a/img/@src')[0]
        title = info.xpath('div[2]/div[1]/a/text()')[0]
        author = info.xpath('div[2]/div[2]/a[1]/text()')[0]
        style = info.xpath('div[2]/div[2]/a[2]/text()')[0]
        status = info.xpath('div[2]/div[2]/span[1]/text()')[0].strip()
        words = info.xpath('div[2]/div[2]/span[2]/text()')[0].strip()[4:]
        latest = info.xpath('div[2]/div[4]/a/text()')[0]
        titleloca = info.xpath('div[2]/div[1]/a/@href')[0]
        latestloca = info.xpath('div[2]/div[4]/a/@href')[0]
        
        try:
        	abstract = info.xpath('div[2]/div[3]/text()')[0].strip()
        except IndexError:
        	abstract = '该作品暂无简介说明'
        
        info_list = [img,title,author,style,status,words,abstract,latest,titleloca,latestloca]
        all_info_list.append(info_list)     #数据存入列表
    time.sleep(1)   
    pass

# 程序主入口
if __name__ == '__main__':
    urls = ['http://book.zongheng.com/store/c0/c0/b0/u5/p{}/v9/s9/t0/u0/i1/ALL.html'.format(str(i)) for i in range(1,1000)]
            
    for url in urls:
        print('正在爬取'+url)
        getInfo(url)

    head = ['img', 'title', 'author', 'style', 'status', 'words', 'abstract', 'latest', 'titleloca', 'latestloca']    #定义表头 
    book = xlwt.Workbook(encoding='utf-8')  #创建工作簿
    sheet = book.add_sheet('Sheet1')        #创建工作表

    for h in range(len(head)):
        sheet.write(0, h, head[h])          #写入表头

    j = 1        #行数	
    for li in all_info_list:
        k = 0    #列数
        for data in li:
            sheet.write(j, k, data)
            k += 1
        j += 1      #写入爬虫数据

    book.save('zonghenginfo.xls')       #保存文件
    pass