const { SharedObject } = require('../src/common/sharedobject')

const c = new SharedObject({
	chatChannels: ['tamina']
})

c.on('update', (e) => {
	console.log(e)
})

c.chatChannels = ['hello', 'truc']
c.chatChannels.push('dekj')