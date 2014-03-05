/*!
 * @copyright &copy; Kartik Visweswaran, Krajee.com, 2013
 * @version 1.0.0
 * 
 * A dynamic strength meter for password input validation with various configurable options.
 * 
 * Enhancement of password meter created by Jeff Todnem (http://www.todnem.com/)
 * 
 * Built originally for Yii Framework 2.0. But is usable across frameworks & scenarios.
 * For more JQuery plugins visit http://plugins.krajee.com
 * For more Yii related demos visit http://demos.krajee.com
 */
(function($) {
    String.prototype.strReverse = function() {
        var newstring = "";
        for (var s = 0; s < this.length; s++) {
            newstring = this.charAt(s) + newstring;
        }
        return newstring;
    };
    var isEmpty = function(value, trim) {
        return value === null || value === undefined || value == []
            || value === '' || trim && $.trim(value) === '';
    };
    var replaceField = function(fld, typ) {
        var id = '#' + fld.attr('id');
        fld.clone(true).attr('type', typ).insertAfter(id).prev().remove();
    };
    // Determine Verdict Index based on overall score
    var getVerdict = function(nScore) {
        if (nScore === null) {
            return 0;
        }
        if (nScore <= 0) {
            return 0;
        }
        if (nScore >= 100) {
            return 5;
        }
        if (nScore <= 20) {
            return 1;
        }
        if (nScore > 20 && nScore <= 40) {
            return 2;
        }
        if (nScore > 40 && nScore <= 60) {
            return 3;
        }
        if (nScore > 60 && nScore <= 80) {
            return 4;
        }
        if (nScore > 80 && nScore < 100) {
            return 5;
        }
    };

    // Calculate the score based on keyed in password text
    var getScore = function(text, config) {
        // Simultaneous variable declaration and value assignment aren't supported in IE apparently
        // so I'm forced to assign the same value individually per var to support a crappy browser *sigh* 
        var nScore = 0, nLength = 0, nAlphaUC = 0, nAlphaLC = 0, nNumber = 0,
            nSymbol = 0, nMidChar = 0, nUnqChar = 0, nRepChar = 0, nRepInc = 0,
            nConsecAlphaUC = 0, nConsecAlphaLC = 0, nConsecNumber = 0, nConsecSymbol = 0,
            nConsecCharType = 0, nSeqAlpha = 0, nSeqNumber = 0, nSeqSymbol = 0, nSeqChar = 0;
        var nMultMidChar = config.midChar, nMultConsecAlphaUC = config.consecAlphaUC,
            nMultConsecAlphaLC = config.consecAlphaLC, nMultConsecNumber = config.consecNumber;
        var nMultSeqAlpha = config.seqAlpha, nMultSeqNumber = config.seqNumber, nMultSeqSymbol = config.seqSymbol;
        var nMultLength = config.length, nMultNumber = config.number, nMultSymbol = config.symbol;
        var nTmpAlphaUC = "", nTmpAlphaLC = "", nTmpNumber = "", nTmpSymbol = "";
        var sAlphas = "abcdefghijklmnopqrstuvwxyz";
        var sNumerics = "01234567890";
        var sSymbols = ")!@#$%^&*()";

        if (text) {
            nScore = parseInt(text.length * nMultLength);
            nLength = text.length;
            var arrPwd = text.replace(/\s+/g, "").split(/\s*/);
            var arrPwdLen = arrPwd.length;
            var str = '';

            /* Loop through password to check for Symbol, Numeric, Lowercase and Uppercase pattern matches */
            for (var a = 0; a < arrPwdLen; a++) {
                str = arrPwd[a];
                if (str.toUpperCase() != str) {
                    if (nTmpAlphaUC !== "" && (nTmpAlphaUC + 1) == a) {
                        nConsecAlphaUC++;
                        nConsecCharType++;
                    }
                    nTmpAlphaUC = a;
                    nAlphaUC++;
                }
                else if (str.toLowerCase() != str) {
                    if (nTmpAlphaLC !== "" && (nTmpAlphaLC + 1) == a) {
                        nConsecAlphaLC++;
                        nConsecCharType++;
                    }
                    nTmpAlphaLC = a;
                    nAlphaLC++;
                }
                else if (str.match(/[0-9]/g)) {
                    if (a > 0 && a < (arrPwdLen - 1)) {
                        nMidChar++;
                    }
                    if (nTmpNumber !== "" && (nTmpNumber + 1) == a) {
                        nConsecNumber++;
                        nConsecCharType++;
                    }
                    nTmpNumber = a;
                    nNumber++;
                }
                else if (str.match(/[^\w]/g)) {
                    if (a > 0 && a < (arrPwdLen - 1)) {
                        nMidChar++;
                    }
                    if (nTmpSymbol !== "" && (nTmpSymbol + 1) == a) {
                        nConsecSymbol++;
                        nConsecCharType++;
                    }
                    nTmpSymbol = a;
                    nSymbol++;
                }
                /* Internal loop through password to check for repeat characters */
                var bCharExists = false;
                for (var b = 0; b < arrPwdLen; b++) {
                    if (arrPwd[a] == arrPwd[b] && a != b) { /* repeat character exists */
                        bCharExists = true;
                        /* 
                         Calculate increment deduction based on proximity to identical characters
                         Deduction is incremented each time a new match is discovered
                         Deduction amount is based on total password length divided by the
                         difference of distance between currently selected match
                         */
                        nRepInc += Math.abs(arrPwdLen / (b - a));
                    }
                }
                if (bCharExists) {
                    nRepChar++;
                    nUnqChar = arrPwdLen - nRepChar;
                    nRepInc = (nUnqChar) ? Math.ceil(nRepInc / nUnqChar) : Math.ceil(nRepInc);
                }
            }

            /* Check for sequential alpha string patterns (forward and reverse) */
            for (var s = 0; s < 23; s++) {
                var sFwd = sAlphas.substring(s, parseInt(s + 3));
                var sRev = sFwd.strReverse();
                if (text.toLowerCase().indexOf(sFwd) != -1 || text.toLowerCase().indexOf(sRev) != -1) {
                    nSeqAlpha++;
                    nSeqChar++;
                }
            }

            /* Check for sequential numeric string patterns (forward and reverse) */
            for (var s = 0; s < 8; s++) {
                var sFwd = sNumerics.substring(s, parseInt(s + 3));
                var sRev = sFwd.strReverse();
                if (text.toLowerCase().indexOf(sFwd) != -1 || text.toLowerCase().indexOf(sRev) != -1) {
                    nSeqNumber++;
                    nSeqChar++;
                }
            }

            /* Check for sequential symbol string patterns (forward and reverse) */
            for (var s = 0; s < 8; s++) {
                var sFwd = sSymbols.substring(s, parseInt(s + 3));
                var sRev = sFwd.strReverse();
                if (text.toLowerCase().indexOf(sFwd) != -1 || text.toLowerCase().indexOf(sRev) != -1) {
                    nSeqSymbol++;
                    nSeqChar++;
                }
            }

            /* Modify overall score value based on usage vs requirements */

            /* General point assignment */
            if (nAlphaUC > 0 && nAlphaUC < nLength) {
                nScore = parseInt(nScore + ((nLength - nAlphaUC) * 2));
            }
            if (nAlphaLC > 0 && nAlphaLC < nLength) {
                nScore = parseInt(nScore + ((nLength - nAlphaLC) * 2));
            }
            if (nNumber > 0 && nNumber < nLength) {
                nScore = parseInt(nScore + (nNumber * nMultNumber));
            }
            if (nSymbol > 0) {
                nScore = parseInt(nScore + (nSymbol * nMultSymbol));
            }
            if (nMidChar > 0) {
                nScore = parseInt(nScore + (nMidChar * nMultMidChar));
            }

            /* Point deductions for poor practices */
            if ((nAlphaLC > 0 || nAlphaUC > 0) && nSymbol === 0 && nNumber === 0) {  // Only Letters
                nScore = parseInt(nScore - nLength);
            }
            if (nAlphaLC === 0 && nAlphaUC === 0 && nSymbol === 0 && nNumber > 0) {  // Only Numbers
                nScore = parseInt(nScore - nLength);
            }
            if (nRepChar > 0) {  // Same character exists more than once
                nScore = parseInt(nScore - nRepInc);
            }
            if (nConsecAlphaUC > 0) {  // Consecutive Uppercase Letters exist
                nScore = parseInt(nScore - (nConsecAlphaUC * nMultConsecAlphaUC));
            }
            if (nConsecAlphaLC > 0) {  // Consecutive Lowercase Letters exist
                nScore = parseInt(nScore - (nConsecAlphaLC * nMultConsecAlphaLC));
            }
            if (nConsecNumber > 0) {  // Consecutive Numbers exist
                nScore = parseInt(nScore - (nConsecNumber * nMultConsecNumber));
            }
            if (nSeqAlpha > 0) {  // Sequential alpha strings exist (3 characters or more)
                nScore = parseInt(nScore - (nSeqAlpha * nMultSeqAlpha));
            }
            if (nSeqNumber > 0) {  // Sequential numeric strings exist (3 characters or more)
                nScore = parseInt(nScore - (nSeqNumber * nMultSeqNumber));
            }
            if (nSeqSymbol > 0) {  // Sequential symbol strings exist (3 characters or more)
                nScore = parseInt(nScore - (nSeqSymbol * nMultSeqSymbol));
            }

            if (nScore > 100) {
                nScore = 100;
            } else if (nScore < 0) {
                nScore = 0;
            }
            return nScore;
        }
        return 0;
    };
    // Strength public class definition
    var Strength = function(element, options) {
        this.verdicts = options.verdicts;
        this.toggleClass = options.toggleClass;
        this.meterClass = options.meterClass;
        this.scoreBarClass = options.scoreBarClass;
        this.scoreClass = options.scoreClass;
        this.verdictClass = options.verdictClass;
        this.inputClass = options.inputClass;
        this.containerClass = options.containerClass;
        this.inputTemplate = options.inputTemplate;
        this.meterTemplate = options.meterTemplate;
        this.mainTemplate = options.mainTemplate;
        this.config = options.config;

        this.$element = $(element);
        this.initialValue = isEmpty(this.$element.val()) ? 0 : this.$element.val();
        var n = getScore(this.initialValue, this.config);;
        this.$container = this.createContainer();
        this.$elToggle = this.$container.find('.kv-toggle');
        this.$elScorebar = this.$container.find('.kv-scorebar');
        this.$elScore = this.$container.find('.kv-score');
        this.$elVerdict = this.$container.find('.kv-verdict');
        
        this.$elScoreInput = $(document.createElement("input")).attr('type', 'hidden').val(n);
        this.$container.append(this.$elScoreInput);
        this.paint(n);
        this.listen();
    };
    Strength.prototype = {
        constructor: Strength,
        listen: function() {
            var self = this;
            self.$element.on('keyup', function(e) {
                self.change(e, this.value);
            });
            self.$element.closest('form').on('reset', function() {
                self.reset();
            });
            self.$elToggle.on('change', function() {
                self.toggle();
            });
        },
        paint: function(nScore) {
            var self = this, n = getVerdict(nScore);
            var sVerdict = self.verdicts[n];
            self.$elScore.attr('class', self.scoreClass + ' ' + self.scoreClass + '-' + n);
            self.$elScorebar.css("background-position", 0 - parseInt(nScore * 4) + "px");
            self.$elScore.html(nScore + "%");
            self.$elVerdict.html(sVerdict);
        },
        change: function(e, text) {
            var self = this, nScore = getScore(text, self.config);
            self.$elScoreInput.val(nScore);
            self.paint(nScore);
            self.$element.trigger('strength.change');
        },
        reset: function() {
            var self = this, nScore = getScore(self.initialValue, self.config);
            self.paint(nScore);
            self.$element.trigger('strength.reset');
        },
        toggle: function() {
            var self = this;
            var inputType = self.$elToggle.is(":checked") ? 'text' : 'password';
            replaceField(self.$element, inputType);
            self.$element.trigger('strength.toggle');
        },
        show: function() {
            var self = this;
            self.$elScorebar.show();
            self.$elScore.show();
            self.$elVerdict.show();
            self.$element.trigger('strength.show');
        },
        hide: function() {
            var self = this;
            self.$elScorebar.hide();
            self.$elScore.hide();
            self.$elVerdict.hide();
            self.$element.trigger('strength.hide');
        },
        createContainer: function() {
            var self = this;
            var output = self.mainTemplate;
            output = output.replace('{input}', self.renderInput());
            output = output.replace('{meter}', self.renderMeter());
            var container = $(document.createElement("div")).attr({"class": self.containerClass}).html(output);
            self.$element.before(container);
            var holder = container.find('.kv-temporary-input');
            var el = self.$element.detach();
            holder.before(el);
            holder.remove();
            return container;
        },
        renderInput: function() {
            var self = this, output = self.inputTemplate;
            self.$element.removeClass(self.inputClass).addClass(self.inputClass);
            output = output.replace('{input}', '<div class="kv-temporary-input"></div>');
            output = output.replace('{toggle}', '<input type="checkbox" class="' + self.toggleClass + '">');
            return output;
        },
        renderMeter: function() {
            var self = this, output = self.meterTemplate;
            output = output.replace('{scorebar}', '<div class="' + self.scoreBarClass + '"></div>');
            output = output.replace('{score}', '<div class="' + self.scoreClass + '"></div>');
            output = output.replace('{verdict}', '<div class="' + self.verdictClass + '"></div>');
            return '<div class="' + self.meterClass + '">' + output + '</div>';
        }
    };

    //strength plugin definition
    $.fn.strength = function(option) {
        var args = Array.apply(null, arguments);
        args.shift();
        return this.each(function() {
            var $this = $(this),
                data = $this.data('strength'),
                options = typeof option === 'object' && option;

            if (!data) {
                $this.data('strength', (data = new Strength(this, $.extend({}, $.fn.strength.defaults, options, $(this).data()))));
            }

            if (typeof option === 'string') {
                data[option].apply(data, args);
            }
        });
    };

    $.fn.strength.defaults = {
        meterClass: 'kv-meter',
        scoreBarClass: 'kv-scorebar',
        scoreClass: 'kv-score',
        verdictClass: 'kv-verdict',
        containerClass: 'kv-password',
        toggleClass: 'kv-toggle',
        inputClass: 'form-control',
        inputTemplate: '<div class="input-group">\n{input}\n<span class="input-group-addon">{toggle}</span>\n</div>',
        meterTemplate: '<div class="kv-scorebar-border">{scorebar}\n{score}</div>\n{verdict}',
        mainTemplate: '<div class="row">\n<div class="col-sm-9">\n{input}</div>\n<div class="col-sm-2">{meter}</div></div>',
        verdicts: {
            0: '<div class="label label-default">Too Short</div>',
            1: '<div class="label label-danger">Very Weak</div>',
            2: '<div class="label label-warning">Weak</div>',
            3: '<div class="label label-info">Good</div>',
            4: '<div class="label label-primary">Strong</div>',
            5: '<div class="label label-success">Very Strong</div>'
        },
        config: {
            midChar: 2,
            consecAlphaUC: 2,
            consecAlphaLC: 2,
            consecNumber: 2,
            seqAlpha: 3,
            seqNumber: 3,
            seqSymbol: 3,
            length: 4,
            number: 4,
            symbol: 6
        }
    };

    /**
     * Convert automatically number inputs with class 'rating' 
     * into the star rating control.
     */
    $(function() {
        var $input = $('input.strength[type=password]');
        if ($input.length > 0) {
            $input.strength();
        }
    });
}(jQuery));