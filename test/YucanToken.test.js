const { expectRevert } = require('@openzeppelin/test-helpers');
const YucanToken = artifacts.require('YucanToken');

contract('YucanToken', ([alice, bob, carol]) => {
    beforeEach(async () => {
        this.yucan = await YucanToken.new('0xb20569782E6471a847Fbd980FbA7ac5Ce6fa1759', { from: alice });
    });

    it('should have correct name and symbol and decimal', async () => {
        const name = await this.yucan.name();
        const symbol = await this.yucan.symbol();
        const decimals = await this.yucan.decimals();
        assert.equal(name.valueOf(), 'yyucan.finance');
        assert.equal(symbol.valueOf(), 'yPLT');
        assert.equal(decimals.valueOf(), '18');
    });

    it('should only allow owner to mint token', async () => {
        await this.yucan.mint(alice, '100', { from: alice });
        await this.yucan.mint(bob, '1000', { from: alice });
        await expectRevert(
            this.yucan.mint(carol, '1000', { from: bob }),
            'Ownable: caller is not the owner',
        );
        const totalSupply = await this.yucan.totalSupply();
        const aliceBal = await this.yucan.balanceOf(alice);
        const bobBal = await this.yucan.balanceOf(bob);
        const carolBal = await this.yucan.balanceOf(carol);
        assert.equal(aliceBal.valueOf(), '100');
        assert.equal(bobBal.valueOf(), '1000');
        assert.equal(carolBal.valueOf(), '0');
    });

    it('should supply token transfers properly', async () => {
        await this.yucan.mint(alice, '100', { from: alice });
        await this.yucan.mint(bob, '1000', { from: alice });
        await this.yucan.transfer(carol, '10', { from: alice });
        await this.yucan.transfer(carol, '100', { from: bob });
        const totalSupply = await this.yucan.totalSupply();
        const aliceBal = await this.yucan.balanceOf(alice);
        const bobBal = await this.yucan.balanceOf(bob);
        const carolBal = await this.yucan.balanceOf(carol);
        assert.equal(totalSupply.valueOf(), '10000000000000000000001100');
        assert.equal(aliceBal.valueOf(), '90');
        assert.equal(bobBal.valueOf(), '900');
        assert.equal(carolBal.valueOf(), '110');
    });

    it('should fail if you try to do bad transfers', async () => {
        await this.yucan.mint(alice, '100', { from: alice });
        await expectRevert(
            this.yucan.transfer(carol, '110', { from: alice }),
            'ERC20: transfer amount exceeds balance',
        );
        await expectRevert(
            this.yucan.transfer(carol, '1', { from: bob }),
            'ERC20: transfer amount exceeds balance',
        );
    });
  });
